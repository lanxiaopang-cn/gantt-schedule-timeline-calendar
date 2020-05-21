/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0
 */

import helpers from '@neuronet.io/vido/src/helpers';
import Main from './components/main';
import ScrollBar from './components/scroll-bar';
import List from './components/list/list';
import ListColumn from './components/list/column/column';
import ListColumnHeader from './components/list/column/column-header';
import ListColumnHeaderResizer from './components/list/column/column-header-resizer';
import ListColumnRow from './components/list/column/column-row';
import ListColumnRowExpander from './components/list/column/column-row-expander';
import ListColumnRowExpanderToggle from './components/list/column/column-row-expander-toggle';
import ListToggle from './components/list/list-toggle';
import Chart from './components/chart/chart';
import ChartCalendar from './components/chart/calendar/calendar';
import ChartCalendarDate from './components/chart/calendar/calendar-date';
import ChartTimeline from './components/chart/timeline/timeline';
import ChartTimelineGrid from './components/chart/timeline/grid/grid';
import ChartTimelineGridRow from './components/chart/timeline/grid/grid-row';
import ChartTimelineGridRowCell from './components/chart/timeline/grid/grid-row-cell';
import ChartTimelineItems from './components/chart/timeline/items/items';
import ChartTimelineItemsRow from './components/chart/timeline/items/items-row';
import ChartTimelineItemsRowItem from './components/chart/timeline/items/items-row-item';

import { Config, Slots, SlotName, Actions, Slot } from './gstc';

export const actionNames: SlotName[] = [
  'main',
  'scroll-bar',
  'list',
  'list-column',
  'list-column-header',
  'list-column-header-resizer',
  'list-column-header-resizer-dots',
  'list-column-row',
  'list-column-row-expander',
  'list-column-row-expander-toggle',
  'list-toggle',
  'chart',
  'chart-calendar',
  'chart-calendar-date',
  'chart-timeline',
  'chart-timeline-grid',
  'chart-timeline-grid-row',
  'chart-timeline-grid-row-cell',
  'chart-timeline-items',
  'chart-timeline-items-row',
  'chart-timeline-items-row-item'
];

function generateEmptyActions(): Actions {
  const actions = {};
  actionNames.forEach(name => (actions[name] = []));
  return actions;
}

function generateEmptySlots(): Slots {
  const slots: Slots = {};
  actionNames.forEach(name => {
    slots[name] = { before: [], inside: [], after: [] } as Slot;
  });
  return slots;
}

// default configuration
function defaultConfig(): Config {
  return {
    debug: false,
    plugins: [],
    plugin: {},
    innerHeight: 428,
    headerHeight: 72,
    components: {
      Main,
      ScrollBar,
      List,
      ListColumn,
      ListColumnHeader,
      ListColumnHeaderResizer,
      ListColumnRow,
      ListColumnRowExpander,
      ListColumnRowExpanderToggle,
      ListToggle,
      Chart,
      ChartCalendar,
      ChartCalendarDate,
      ChartTimeline,
      ChartTimelineGrid,
      ChartTimelineGridRow,
      ChartTimelineGridRowCell,
      ChartTimelineItems,
      ChartTimelineItemsRow,
      ChartTimelineItemsRowItem
    },
    wrappers: {
      Main(input) {
        return input;
      },
      ScrollBar(input) {
        return input;
      },
      List(input) {
        return input;
      },
      ListColumn(input) {
        return input;
      },
      ListColumnHeader(input) {
        return input;
      },
      ListColumnHeaderResizer(input) {
        return input;
      },
      ListColumnRow(input) {
        return input;
      },
      ListColumnRowExpander(input) {
        return input;
      },
      ListColumnRowExpanderToggle(input) {
        return input;
      },
      ListToggle(input) {
        return input;
      },
      Chart(input) {
        return input;
      },
      ChartCalendar(input) {
        return input;
      },
      ChartCalendarDate(input) {
        return input;
      },
      ChartTimeline(input) {
        return input;
      },
      ChartTimelineGrid(input) {
        return input;
      },
      ChartTimelineGridRow(input) {
        return input;
      },
      ChartTimelineGridRowCell(input) {
        return input;
      },
      ChartTimelineItems(input) {
        return input;
      },
      ChartTimelineItemsRow(input) {
        return input;
      },
      ChartTimelineItemsRowItem(input) {
        return input;
      }
    },
    slots: generateEmptySlots(),
    list: {
      rows: {},
      row: {
        height: 40,
        gap: {
          top: 0,
          bottom: 0
        }
      },
      columns: {
        percent: 100,
        resizer: {
          width: 10,
          inRealTime: true,
          dots: 6
        },
        minWidth: 50,
        data: {}
      },
      expander: {
        padding: 18,
        size: 20,
        icon: {
          width: 16,
          height: 16
        },
        icons: {
          child:
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><ellipse ry="4" rx="4" id="svg_1" cy="12" cx="12" fill="#000000B0"/></svg>',
          open:
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>',
          closed:
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>'
        }
      },
      toggle: {
        display: true,
        icons: {
          open:
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path stroke="null" d="m16.406954,16.012672l4.00393,-4.012673l-4.00393,-4.012673l1.232651,-1.232651l5.245324,5.245324l-5.245324,5.245324l-1.232651,-1.232651z"/><path stroke="null" d="m-0.343497,12.97734zm1.620144,0l11.341011,0l0,-1.954681l-11.341011,0l0,1.954681zm0,3.909362l11.341011,0l0,-1.954681l-11.341011,0l0,1.954681zm0,-9.773404l0,1.95468l11.341011,0l0,-1.95468l-11.341011,0z"/></svg>',
          close:
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path transform="rotate(-180 4.392796516418457,12) " stroke="null" d="m1.153809,16.012672l4.00393,-4.012673l-4.00393,-4.012673l1.232651,-1.232651l5.245324,5.245324l-5.245324,5.245324l-1.232651,-1.232651z"/><path stroke="null" d="m9.773297,12.97734zm1.620144,0l11.341011,0l0,-1.954681l-11.341011,0l0,1.954681zm0,3.909362l11.341011,0l0,-1.954681l-11.341011,0l0,1.954681zm0,-9.773404l0,1.95468l11.341011,0l0,-1.95468l-11.341011,0z"/></svg>'
        }
      }
    },
    scroll: {
      bodyClassName: 'gstc-scrolling',
      horizontal: {
        size: 20,
        minInnerSize: 40,
        data: null,
        posPx: 0,
        maxPosPx: 0,
        area: 0,
        multiplier: 3,
        offset: 0,
        smooth: false
      },
      vertical: {
        size: 20,
        minInnerSize: 40,
        data: null,
        posPx: 0,
        maxPosPx: 0,
        area: 0,
        multiplier: 3,
        offset: 0,
        smooth: false
      }
    },
    chart: {
      time: {
        period: 'day',
        from: 0,
        to: 0,
        zoom: 20,
        leftGlobal: 0,
        centerGlobal: 0,
        rightGlobal: 0,
        levels: [],
        calculatedZoomMode: false,
        onLevelDates: [],
        onCurrentViewLevelDates: [],
        onDate: [],
        allDates: [],
        additionalSpaceAdded: false
      },
      calendar: {
        expand: true,
        levels: [
          {
            formats: [
              {
                zoomTo: 17,
                period: 'day',
                className: 'gstc-date-medium gstc-date-left',
                format({ timeStart }) {
                  return timeStart.format('DD MMMM YYYY (dddd)');
                }
              },
              {
                zoomTo: 23,
                period: 'month',
                format({ timeStart }) {
                  return timeStart.format('MMMM YYYY');
                }
              },
              {
                zoomTo: 24,
                period: 'month',
                format({ timeStart }) {
                  return timeStart.format("MMMM 'YY");
                }
              },
              {
                zoomTo: 25,
                period: 'month',
                format({ timeStart }) {
                  return timeStart.format('MMM YYYY');
                }
              },
              {
                zoomTo: 27,
                period: 'year',
                format({ timeStart }) {
                  return timeStart.format('YYYY');
                }
              },
              {
                zoomTo: 100,
                period: 'year',
                default: true,
                format() {
                  return null;
                }
              }
            ]
          },
          {
            main: true,
            formats: [
              {
                zoomTo: 16,
                period: 'hour',
                format({ timeStart }) {
                  return timeStart.format('HH:mm');
                }
              },
              {
                zoomTo: 17,
                period: 'hour',
                default: true,
                format({ timeStart }) {
                  return timeStart.format('HH');
                }
              },
              {
                zoomTo: 19,
                period: 'day',
                className: 'gstc-date-medium',
                format({ timeStart, className, vido }) {
                  return vido.html`<span class="${className}-content gstc-date-bold">${timeStart.format(
                    'DD'
                  )}</span> <span class="${className}-content gstc-date-thin">${timeStart.format('dddd')}</span>`;
                }
              },
              {
                zoomTo: 20,
                period: 'day',
                default: true,
                format({ timeStart, vido, className }) {
                  return vido.html`<div class="${className}-content gstc-date-top">${timeStart.format(
                    'DD'
                  )}</div><div class="${className}-content gstc-date-small">${timeStart.format('dddd')}</div>`;
                }
              },
              {
                zoomTo: 21,
                period: 'day',
                format({ timeStart, vido, className }) {
                  return vido.html`<div class="${className}-content gstc-date-top">${timeStart.format(
                    'DD'
                  )}</div><div class="${className}-content gstc-date-small">${timeStart.format('ddd')}</div>`;
                }
              },
              {
                zoomTo: 22,
                period: 'day',
                className: 'gstc-date-vertical',
                format({ timeStart, className, vido }) {
                  return vido.html`<div class="${className}-content gstc-date-top">${timeStart.format(
                    'DD'
                  )}</div><div class="${className}-content gstc-date-extra-small">${timeStart.format('ddd')}</div>`;
                }
              },
              {
                zoomTo: 23,
                period: 'week',
                default: true,
                format({ timeStart, timeEnd, className, vido }) {
                  return vido.html`<div class="${className}-content gstc-date-top">${timeStart.format(
                    'DD'
                  )} - ${timeEnd.format(
                    'DD'
                  )}</div><div class="${className}-content gstc-date-small gstc-date-thin">${timeStart.format(
                    'ddd'
                  )} - ${timeEnd.format('dd')}</div>`;
                }
              },
              {
                zoomTo: 25,
                period: 'week',
                className: 'gstc-date-vertical',
                format({ timeStart, timeEnd, className, vido }) {
                  return vido.html`<div class="${className}-content gstc-date-top gstc-date-small gstc-date-normal">${timeStart.format(
                    'DD'
                  )}</div><div class="gstc-dash gstc-date-small">-</div><div class="${className}-content gstc-date-small gstc-date-normal">${timeEnd.format(
                    'DD'
                  )}</div>`;
                }
              },
              {
                zoomTo: 26,
                period: 'month',
                default: true,
                className: 'gstc-date-month-level-1',
                format({ timeStart, vido, className }) {
                  return vido.html`<div class="${className}-content gstc-date-top">${timeStart.format(
                    'MMM'
                  )}</div><div class="${className}-content gstc-date-small gstc-date-bottom">${timeStart.format(
                    'MM'
                  )}</div>`;
                }
              },
              {
                zoomTo: 27,
                period: 'month',
                className: 'gstc-date-vertical',
                format({ timeStart, className, vido }) {
                  return vido.html`<div class="${className}-content gstc-date-top">${timeStart.format(
                    'MM'
                  )}</div><div class="${className}-content gstc-date-extra-small">${timeStart.format('MMM')}</div>`;
                }
              },
              {
                zoomTo: 28,
                period: 'year',
                default: true,
                className: 'gstc-date-big',
                format({ timeStart }) {
                  return timeStart.format('YYYY');
                }
              },
              {
                zoomTo: 29,
                period: 'year',
                className: 'gstc-date-medium',
                format({ timeStart }) {
                  return timeStart.format('YYYY');
                }
              },
              {
                zoomTo: 30,
                period: 'year',
                className: 'gstc-date-medium',
                format({ timeStart }) {
                  return timeStart.format('YY');
                }
              },
              {
                zoomTo: 100,
                period: 'year',
                default: true,
                format() {
                  return null;
                }
              }
            ]
          }
        ]
      },
      grid: {
        cell: {
          onCreate: []
        }
      },
      item: {
        gap: {
          top: 4,
          bottom: 4
        },
        top: 0,
        height: 40 - 8,
        minWidth: 10
      },
      items: {},
      spacing: 1
    },
    classNames: {},
    actions: generateEmptyActions(),
    locale: {
      name: 'en',
      weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
      weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
      weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
      months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
      monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
      weekStart: 1,
      relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years'
      },
      formats: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'DD/MM/YYYY',
        LL: 'D MMMM YYYY',
        LLL: 'D MMMM YYYY HH:mm',
        LLLL: 'dddd, D MMMM YYYY HH:mm'
      },
      ordinal: (n: number) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return `[${n}${s[(v - 20) % 10] || s[v] || s[0]}]`;
      }
    },
    utcMode: false,
    usageStatistics: true,
    merge(target: object, source: object) {
      return helpers.mergeDeep({}, target, source);
    }
  };
}

export default defaultConfig;
