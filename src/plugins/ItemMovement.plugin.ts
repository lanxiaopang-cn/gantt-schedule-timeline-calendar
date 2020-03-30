/**
 * ItemMovement plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

export interface Options {
  moveable?: boolean | string;
  resizable?: boolean;
  resizerContent?: string;
  collisionDetection?: boolean;
  outOfBorders?: boolean;
  snapStart?: (timeStart: number, startDiff: number, item: object) => number;
  snapEnd?: (timeEnd: number, endDiff: number, item: object) => number;
  ghostNode?: boolean;
  wait?: number;
}

export interface Movement {
  moving: boolean;
  resizing: boolean;
  waiting: boolean;
  ghost?: HTMLElement;
  itemTop?: number;
  itemX?: number;
  ganttTop?: number;
  ganttLeft?: number;
}

export default function ItemMovement(options: Options = {}) {
  const defaultOptions = {
    moveable: true,
    resizable: true,
    resizerContent: '',
    collisionDetection: true,
    outOfBorders: false,
    snapStart(timeStart, startDiff) {
      return timeStart + startDiff;
    },
    snapEnd(timeEnd, endDiff) {
      return timeEnd + endDiff;
    },
    ghostNode: true,
    wait: 0
  };
  options = { ...defaultOptions, ...options };

  const movementState = {};

  /**
   * Add moving functionality to items as action
   *
   * @param {HTMLElement} element DOM Node
   * @param {Object} data
   */
  function ItemAction(element: HTMLElement, data) {
    if (!options.moveable && !options.resizable) {
      return;
    }
    const state = data.state;
    const api = data.api;

    function isMoveable(data) {
      let moveable = options.moveable;
      if (data.item.hasOwnProperty('moveable') && moveable) {
        moveable = data.item.moveable;
      }
      if (data.row.hasOwnProperty('moveable') && moveable) {
        moveable = data.row.moveable;
      }
      return moveable;
    }

    function isResizable(data) {
      let resizable = options.resizable && (!data.item.hasOwnProperty('resizable') || data.item.resizable === true);
      if (data.row.hasOwnProperty('resizable') && resizable) {
        resizable = data.row.resizable;
      }
      return resizable;
    }

    function getMovement(data) {
      const itemId = data.item.id;
      if (typeof movementState[itemId] === 'undefined') {
        movementState[itemId] = { moving: false, resizing: false, waiting: false };
      }
      return movementState[itemId];
    }

    function saveMovement(itemId: string, movement: Movement) {
      state.update(`config.plugin.ItemMovement.item`, { id: itemId, ...movement });
      state.update('config.plugin.ItemMovement.movement', (current: Movement) => {
        if (!current) {
          current = { moving: false, waiting: false, resizing: false };
        }
        current.moving = movement.moving;
        current.waiting = movement.waiting;
        current.resizing = movement.resizing;
        return current;
      });
    }

    function createGhost(data, normalized, ganttLeft, ganttTop) {
      const movement: Movement = getMovement(data);
      if (!options.ghostNode || typeof movement.ghost !== 'undefined') {
        return;
      }
      const ghost = element.cloneNode(true) as HTMLElement;
      const style = getComputedStyle(element);
      ghost.style.position = 'absolute';
      ghost.style.left = normalized.clientX - ganttLeft + 'px';
      const itemTop = normalized.clientY - ganttTop - element.offsetTop + parseInt(style['margin-top']);
      movement.itemTop = itemTop;
      ghost.style.top = normalized.clientY - ganttTop - itemTop + 'px';
      ghost.style.width = style.width;
      ghost.style['box-shadow'] = '10px 10px 6px #00000020';
      const height = element.clientHeight + 'px';
      ghost.style.height = height;
      ghost.style['line-height'] = element.clientHeight - 18 + 'px';
      ghost.style.opacity = '0.6';
      ghost.style.transform = 'scale(1.05, 1.05)';
      state.get('_internal.elements.chart-timeline').appendChild(ghost);
      movement.ghost = ghost;
      saveMovement(data.item.id, movement);
      return ghost;
    }

    function moveGhost(data, normalized) {
      if (options.ghostNode) {
        const movement = getMovement(data);
        const left = normalized.clientX - movement.ganttLeft;
        movement.ghost.style.left = left + 'px';
        movement.ghost.style.top =
          normalized.clientY -
          movement.ganttTop -
          movement.itemTop +
          parseInt(getComputedStyle(element)['margin-top']) +
          'px';
        saveMovement(data.item.id, movement);
      }
    }

    function destroyGhost(itemId) {
      if (!options.ghostNode) {
        return;
      }
      if (typeof movementState[itemId] !== 'undefined' && typeof movementState[itemId].ghost !== 'undefined') {
        state.get('_internal.elements.chart-timeline').removeChild(movementState[itemId].ghost);
        delete movementState[itemId].ghost;
        saveMovement(data.item.id, movementState[itemId]);
      }
    }

    function getSnapStart(data) {
      let snapStart = options.snapStart;
      if (typeof data.item.snapStart === 'function') {
        snapStart = data.item.snapStart;
      }
      return snapStart;
    }

    function getSnapEnd(data) {
      let snapEnd = options.snapEnd;
      if (typeof data.item.snapEnd === 'function') {
        snapEnd = data.item.snapEnd;
      }
      return snapEnd;
    }

    const resizerHTML = `<div class="${api.getClass('chart-timeline-items-row-item-resizer')}">${
      options.resizerContent
    }</div>`;
    // @ts-ignore
    element.insertAdjacentHTML('beforeend', resizerHTML);
    const resizerEl: HTMLElement = element.querySelector(
      '.gantt-schedule-timeline-calendar__chart-timeline-items-row-item-resizer'
    );
    if (!isResizable(data)) {
      resizerEl.style.visibility = 'hidden';
    } else {
      resizerEl.style.visibility = 'visible';
    }

    function labelDown(ev) {
      if ((ev.type === 'pointerdown' || ev.type === 'mousedown') && ev.button !== 0) {
        return;
      }
      const movement: Movement = getMovement(data);
      movement.waiting = true;
      saveMovement(data.item.id, movement);
      setTimeout(() => {
        ev.stopPropagation();
        ev.preventDefault();
        if (!movement.waiting) return;
        movement.moving = true;
        const item = state.get(`config.chart.items.${data.item.id}`);
        const chartLeftTime = state.get('_internal.chart.time.leftGlobal');
        const timePerPixel = state.get('_internal.chart.time.timePerPixel');
        const ganttRect = state.get('_internal.elements.chart-timeline').getBoundingClientRect();
        movement.ganttTop = ganttRect.top;
        movement.ganttLeft = ganttRect.left;
        movement.itemX = Math.round((item.time.start - chartLeftTime) / timePerPixel);
        saveMovement(data.item.id, movement);
        createGhost(data, ev, ganttRect.left, ganttRect.top);
      }, options.wait);
    }

    function resizerDown(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      if ((ev.type === 'pointerdown' || ev.type === 'mousedown') && ev.button !== 0) {
        return;
      }
      const movement = getMovement(data);
      movement.resizing = true;
      const item = state.get(`config.chart.items.${data.item.id}`);
      const chartLeftTime = state.get('_internal.chart.time.leftGlobal');
      const timePerPixel = state.get('_internal.chart.time.timePerPixel');
      const ganttRect = state.get('_internal.elements.chart-timeline').getBoundingClientRect();
      movement.ganttTop = ganttRect.top;
      movement.ganttLeft = ganttRect.left;
      movement.itemX = (item.time.end - chartLeftTime) / timePerPixel;
      saveMovement(data.item.id, movement);
    }

    function isCollision(rowId, itemId, start, end) {
      if (!options.collisionDetection) {
        return false;
      }
      const time = state.get('_internal.chart.time');
      if (options.outOfBorders && (start < time.from || end > time.to)) {
        return true;
      }
      let diff = api.time.date(end).diff(start, 'milliseconds');
      if (Math.sign(diff) === -1) {
        diff = -diff;
      }
      if (diff <= 1) {
        return true;
      }
      const row = state.get('config.list.rows.' + rowId);
      for (const rowItem of row._internal.items) {
        if (rowItem.id !== itemId) {
          if (start >= rowItem.time.start && start <= rowItem.time.end) {
            return true;
          }
          if (end >= rowItem.time.start && end <= rowItem.time.end) {
            return true;
          }
          if (start <= rowItem.time.start && end >= rowItem.time.end) {
            return true;
          }
        }
      }
      return false;
    }

    function movementX(normalized, row, item, zoom, timePerPixel) {
      const movement = getMovement(data);
      const left = normalized.clientX - movement.ganttLeft;
      moveGhost(data, normalized);
      const leftMs = state.get('_internal.chart.time.leftGlobal') + left * timePerPixel;
      const add = leftMs - item.time.start;
      const originalStart = item.time.start;
      const finalStartTime = getSnapStart(data)(item.time.start, add, item);
      const finalAdd = finalStartTime - originalStart;
      const collision = isCollision(row.id, item.id, item.time.start + finalAdd, item.time.end + finalAdd);
      if (finalAdd && !collision) {
        state.update(`config.chart.items.${data.item.id}.time`, function moveItem(time) {
          time.start += finalAdd;
          time.end = getSnapEnd(data)(time.end, finalAdd, item) - 1;
          return time;
        });
      }
    }

    function resizeX(normalized, row, item, zoom, timePerPixel) {
      if (!isResizable(data)) {
        return;
      }
      const time = state.get('_internal.chart.time');
      const movement = getMovement(data);
      const left = normalized.clientX - movement.ganttLeft;
      const leftMs = time.leftGlobal + left * timePerPixel;
      const add = leftMs - item.time.end;
      if (item.time.end + add < item.time.start) {
        return;
      }
      const originalEnd = item.time.end;
      const finalEndTime = getSnapEnd(data)(item.time.end, add, item) - 1;
      const finalAdd = finalEndTime - originalEnd;
      const collision = isCollision(row.id, item.id, item.time.start, item.time.end + finalAdd);
      if (finalAdd && !collision) {
        state.update(`config.chart.items.${data.item.id}.time`, time => {
          time.start = getSnapStart(data)(time.start, 0, item);
          time.end = getSnapEnd(data)(time.end, finalAdd, item) - 1;
          return time;
        });
      }
    }

    function movementY(normalized, row, item, zoom, timePerPixel) {
      moveGhost(data, normalized);
      const movement = getMovement(data);
      const top = normalized.clientY - movement.ganttTop;
      const visibleRows = state.get('_internal.list.visibleRows');
      let index = 0;
      for (const currentRow of visibleRows) {
        if (currentRow.top > top) {
          if (index > 0) {
            return index - 1;
          }
          return 0;
        }
        index++;
      }
      return index;
    }

    function documentMove(ev) {
      const movement = getMovement(data);
      let item, rowId, row, zoom, timePerPixel;
      if (movement.moving || movement.resizing) {
        ev.stopPropagation();
        ev.preventDefault();
        item = state.get(`config.chart.items.${data.item.id}`);
        rowId = state.get(`config.chart.items.${data.item.id}.rowId`);
        row = state.get(`config.list.rows.${rowId}`);
        zoom = state.get('_internal.chart.time.zoom');
        timePerPixel = state.get('_internal.chart.time.timePerPixel');
      }
      const moveable = isMoveable(data);
      if (movement.moving) {
        if (moveable === true || moveable === 'x' || (Array.isArray(moveable) && moveable.includes(rowId))) {
          movementX(ev, row, item, zoom, timePerPixel);
        }
        if (!moveable || moveable === 'x') {
          return;
        }
        let visibleRowsIndex = movementY(ev, row, item, zoom, timePerPixel);
        const visibleRows = state.get('_internal.list.visibleRows');
        if (typeof visibleRows[visibleRowsIndex] === 'undefined') {
          if (visibleRowsIndex > 0) {
            visibleRowsIndex = visibleRows.length - 1;
          } else if (visibleRowsIndex < 0) {
            visibleRowsIndex = 0;
          }
        }
        const newRow = visibleRows[visibleRowsIndex];
        const newRowId = newRow.id;
        const collision = isCollision(newRowId, item.id, item.time.start, item.time.end);
        if (newRowId !== item.rowId && !collision) {
          if (!Array.isArray(moveable) || moveable.includes(newRowId)) {
            if (!newRow.hasOwnProperty('moveable') || newRow.moveable) {
              state.update(`config.chart.items.${item.id}.rowId`, newRowId);
            }
          }
        }
      } else if (movement.resizing && (typeof item.resizable === 'undefined' || item.resizable === true)) {
        resizeX(ev, row, item, zoom, timePerPixel);
      }
    }

    function documentUp(ev) {
      const movement = getMovement(data);
      if (movement.moving || movement.resizing || movement.waiting) {
        ev.stopPropagation();
        ev.preventDefault();
      } else {
        return;
      }
      movement.moving = false;
      movement.waiting = false;
      movement.resizing = false;
      saveMovement(data.item.id, movement);
      for (const itemId in movementState) {
        movementState[itemId].moving = false;
        movementState[itemId].resizing = false;
        movementState[itemId].waiting = false;
        destroyGhost(itemId);
      }
    }

    element.addEventListener('pointerdown', labelDown);
    resizerEl.addEventListener('pointerdown', resizerDown);
    document.addEventListener('pointermove', documentMove);
    document.addEventListener('pointerup', documentUp);

    return {
      update(node, changedData) {
        if (!isResizable(changedData) && resizerEl.style.visibility === 'visible') {
          resizerEl.style.visibility = 'hidden';
        } else if (isResizable(changedData) && resizerEl.style.visibility === 'hidden') {
          resizerEl.style.visibility = 'visible';
        }
        data = changedData;
      },
      destroy(node, data) {
        element.removeEventListener('pointerdown', labelDown);
        resizerEl.removeEventListener('pointerdown', resizerDown);
        document.removeEventListener('pointermove', documentMove);
        document.removeEventListener('pointerup', documentUp);
        resizerEl.remove();
      }
    };
  }

  return function initialize(vido) {
    vido.state.update('config.actions.chart-timeline-items-row-item', actions => {
      actions.push(ItemAction);
      return actions;
    });
  };
}
