/**
 * Selection plugin
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import {
  PluginData as TimelinePointerPluginData,
  ITEM,
  ITEM_TYPE,
  CELL,
  CELL_TYPE,
  Point,
  PointerState
} from '../TimelinePointer.plugin';

import { Wrap } from './Wrapper';
import { Item, Cell, Items, Vido } from '../../types';
import DeepState from 'deep-state-observer';
import { Api } from '../../api/Api';

export interface Options {
  enabled?: boolean;
  cells?: boolean;
  items?: boolean;
  rows?: boolean;
  showOverlay?: boolean;
  canSelect?: (type, state, all) => any[];
  canDeselect?: (type, state, all) => any[];
}

export interface SelectionItems {
  [key: string]: Item[];
}

export interface SelectState {
  selecting?: SelectionItems;
  selected?: SelectionItems;
}

function prepareOptions(options: Options) {
  const defaultOptions: Options = {
    enabled: true,
    cells: true,
    items: true,
    rows: false,
    showOverlay: true,
    canSelect(type, currently, all) {
      return currently;
    },
    canDeselect(type, currently, all) {
      return [];
    }
  };
  options = { ...defaultOptions, ...options } as Options;
  return options;
}

const pluginPath = 'config.plugin.Selection';

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Selection {
  [ITEM]: Item[];
  [CELL]: Cell[];
}

export interface PointerEvents {
  down: PointerEvent | null;
  move: PointerEvent | null;
  up: PointerEvent | null;
}

export interface PluginData extends Options {
  enabled: boolean;
  isSelecting: boolean;
  showOverlay: boolean;
  pointerState: PointerState;
  initialPosition: Point;
  currentPosition: Point;
  selectionArea: Area;
  selected: Selection;
  selecting: Selection;
  events: PointerEvents;
  targetType: ITEM_TYPE | CELL_TYPE | '';
}

function generateEmptyData(options: Options): PluginData {
  return {
    enabled: true,
    showOverlay: true,
    isSelecting: false,
    pointerState: 'up',
    targetType: '',
    initialPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    selectionArea: { x: 0, y: 0, width: 0, height: 0 },
    selecting: {
      [ITEM]: [],
      [CELL]: []
    },
    selected: {
      [ITEM]: [],
      [CELL]: []
    },
    events: {
      down: null,
      move: null,
      up: null
    },
    ...options
  };
}

class SelectionPlugin {
  private data: PluginData;
  private poitnerData: TimelinePointerPluginData;
  private vido: Vido;
  private state: DeepState;
  private api: Api;
  private options: Options;
  private unsub = [];

  constructor(vido: Vido, options: Options) {
    this.vido = vido;
    this.state = vido.state;
    this.api = vido.api;
    this.options = options;
    this.data = generateEmptyData(options);
    this.unsub.push(
      this.state.subscribe('config.plugin.TimelinePointer', timelinePointerData => {
        this.poitnerData = timelinePointerData;
        this.onPointerData();
      })
    );
    this.updateData();
    this.unsub.push(
      this.state.subscribe(pluginPath, value => {
        this.data = value;
      })
    );
  }

  public destroy() {
    this.unsub.forEach(unsub => unsub());
  }

  private updateData() {
    this.state.update(pluginPath, { ...this.data });
  }

  private getItemsUnderSelectionArea(): Item[] {
    return [];
  }

  private getSelectionArea(): Area {
    const area = { x: 0, y: 0, width: 0, height: 0 };
    const initial = { ...this.poitnerData.initialPosition };
    const current = { ...this.poitnerData.currentPosition };
    const width = current.x - initial.x;
    const height = current.y - initial.y;
    if (width >= 0) {
      area.x = initial.x;
      area.width = width;
    } else {
      area.x = current.x;
      area.width = Math.abs(width);
    }
    if (height >= 0) {
      area.y = initial.y;
      area.height = height;
    } else {
      area.y = current.y;
      area.height = Math.abs(height);
    }
    return area;
  }

  private collectLinkedItems(item: Item, current: Item[] = []): Item[] {
    if (item.linkedWith && item.linkedWith.length) {
      const items: Items = this.state.get('config.chart.items');
      for (const linkedItemId of item.linkedWith) {
        const linkedItem: Item = items[linkedItemId];
        current.push(linkedItem);
        this.collectLinkedItems(linkedItem, current);
      }
    }
    return current;
  }

  private getSelected(item: Item): Item[] {
    let selected: Item[];
    if (this.data.selected[ITEM].find(selectedItem => selectedItem.id === item.id)) {
      selected = this.data.selected[ITEM];
    } else {
      if (this.poitnerData.events.down.ctrlKey) {
        selected = [...new Set([...this.data.selected[ITEM], ...this.collectLinkedItems(item, [item])]).values()];
      } else {
        selected = this.collectLinkedItems(item, [item]);
      }
    }
    return selected;
  }

  private selectCells() {
    this.data.isSelecting = true;
    this.data.selectionArea = this.getSelectionArea();
    const selectingItems = this.getItemsUnderSelectionArea();
    if (selectingItems.length === 0) {
      this.state.update(`config.chart.items.*.selected`, false);
      this.data.selected[ITEM].length = 0;
    }
    // TODO save selecting items and cells
  }

  private selectItems() {
    this.data.isSelecting = false;
    this.data.selectionArea = this.getSelectionArea();
    this.data.currentPosition = this.poitnerData.currentPosition;
    this.data.initialPosition = this.poitnerData.initialPosition;
    const item: Item = this.poitnerData.targetData;
    this.data.selected[ITEM] = this.getSelected(item);
    let multi = this.state.multi();
    multi = multi.update(`config.chart.items.*.selected`, false);
    for (const item of this.data.selected[ITEM]) {
      multi = multi.update(`config.chart.items.${item.id}.selected`, true);
    }
    multi.done();
  }

  private onPointerData() {
    if (this.poitnerData.isMoving && this.poitnerData.targetType === CELL && this.data.cells) {
      this.selectCells();
    } else if (this.poitnerData.isMoving && this.poitnerData.targetType === ITEM && this.data.items) {
      this.selectItems();
    } else if (!this.poitnerData.isMoving) {
      this.data.isSelecting = false;
    }
    this.data.events = this.poitnerData.events;
    this.data.pointerState = this.poitnerData.pointerState;
    this.data.targetType = this.poitnerData.targetType;
    this.updateData();
  }
}

export function Plugin(options: Options = {}) {
  options = prepareOptions(options);

  return function initialize(vidoInstance: Vido) {
    const selectionPlugin = new SelectionPlugin(vidoInstance, options);
    vidoInstance.state.update(pluginPath, generateEmptyData(options));
    vidoInstance.state.update('config.wrappers.ChartTimelineItems', oldWrapper => {
      return Wrap(oldWrapper, vidoInstance);
    });
    return function destroy() {
      selectionPlugin.destroy();
    };
  };
}
