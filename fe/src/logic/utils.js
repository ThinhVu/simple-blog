import {uniq} from 'lodash';

export function sumFields(o1, o2) {
  o1 = o1 || {}
  o2 = o2 || {}
  const fields = uniq([...Object.keys(o1), ...Object.keys(o2)])
  const o = {}
  for (const f of fields) {
    o[f] = (o1[f] || 0) + (o2[f] || 0)
  }
  return o
}

function parsePattern(input, pattern, type, parseValue) {
  const matches = [...input.matchAll(pattern)]
  const parts = []
  let i = 0;
  for (let match of matches) {
    const matchVal = match[0];
    const matchStart = match['index'];
    if (i < matchStart) {
      parts.push(...parseUrl(input.substr(i, matchStart - i)))
      i += matchStart - i;
    }
    parts.push({
      type: type,
      value: parseValue(matchVal)
    });
    i += matchVal.length;
  }

  if (i<input.length) {
    parts.push(...parseUrl(input.substr(i, input.length - i)))
  }
  return parts;
}

export function parseUrl(txt) {
  if (/(?<url>https?:\/\/\S+)/g.exec(txt)) {
    return parsePattern(txt, /(?<url>https?:\/\/\S+)/g, 'href', v => ({ href: v, text: v.substr(0, 50) }) )
  } else {
    return [{ type: 'text', value: txt }]
  }
}

export function parseContent(input) {
  try {
    return parsePattern(input, /\[@\S+=.*?\]/g, 'ref', val => /\[@(?<uid>\S+)=(?<fullName>.*?)\]/g.exec(val).groups)
  } catch (e) {
    console.error(e, input)
    return [{type: 'text', value: input}];
  }
}

import _ from 'lodash';
import dayjs from 'dayjs';
import api from '@/logic/api';
import notification from '@/components/UiLib/Api/notification';

export function readableMs(ms) {
  let remain = ms;
  const days = Math.floor(ms / 86400000);
  remain = remain - days * 86400000;
  const hours = Math.floor(remain / 3600000)
  remain = remain - hours * 3600000
  const minutes = Math.floor( remain / 60000)
  remain = remain - minutes * 60000
  const seconds = Math.floor(remain / 1000)
  return (days ? `${days}d` : '') + (hours ? `${hours}h` : '') + (minutes ? `${minutes}m` : '') + (seconds ? `${seconds}s` : '')
}

export function readableDiff(d) {
  const ms = dayjs().diff(dayjs(d), 'millisecond')
  return readableMs(ms)
}

export async function getWorkerIp(workerId) {
  const key = `vps_${workerId}`
  let vps, vpsStr = localStorage.getItem(key)
  if (vpsStr) {
    vps = JSON.parse(vpsStr)
  } else {
    vps = await api.vps.read(workerId)
    localStorage.setItem(key, JSON.stringify(vps))
  }
  return vps && vps.ip || workerId
}

export function metric2Str(metricObj) {
  if (!metricObj)
    return ''
  return Object.keys(metricObj).reduce((output, currentKey) => {
    output.push(`${_.lowerCase(currentKey)} ${metricObj[currentKey]}`)
    return output
  }, []).join(' · ')
}

export function openFileDialog(options = { multiple: false, mimeType: '*/*' }) {
  return new Promise(resolve => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = options.mimeType
    input.multiple = options.multiple
    input.addEventListener('change', e => resolve(e.target.files));
    document.body.appendChild(input)
    input.style.display = 'none'
    input.click()
    input.parentNode.removeChild(input)
  })
}

export async function readFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.addEventListener('load', event => resolve(event.target.result));
    reader.readAsText(file, 'utf-8');
  })
}

export function notEmpty(x) { return x }

export function removeCarry(v) { return v.replace('\r', '') }

export function ms2H(ms) {
  return _.round(ms / 3600000, 2)
}

export async function copyToClipboard(content) {
  await navigator.clipboard.writeText(content)
  notification.success('Copied')
}

export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

