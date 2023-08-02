import fs from 'fs'
import {glob} from 'glob-promise'

interface Level {
  id: string
  collision: number[][]
  startPos: { x: number, y: number }
}

interface Resource {
  type: string,
  id: string,
  path: string,
  data?: string
}

async function readObjectFromJson<T>(path: string): Promise<T> {
  const content = fs.readFileSync(path, 'utf-8')
  const level = JSON.parse(content)
  return level as T
}

async function readObjectsFromGlob<T>(path: string): Promise<T[]> {
  const files = await glob.glob(path)
  return Promise.all(files.map(readObjectFromJson<T>))
}

const writeFileIfContentChanged = async (path: string, content: string) => {
  console.log('*', path)
  const oldContent = fs.existsSync(path) && fs.readFileSync(path, 'utf-8')
  if (oldContent !== content) {
    console.log('  - File changed, writing new content')
    await fs.promises.writeFile(path, content)
  } else {
    console.log('  - File not changed, skipping')
  }
}

const writeResourcesH = async (levels: Level[]) => {
  const resourcesStr = await fs.promises.readFile('res/resources.json', 'utf-8')
  let resources = JSON.parse(resourcesStr) as Resource[]

  levels.forEach(level => {
    resources = resources.concat([
      {
        "type": "TILESET",
        "id": `${level.id}_tileset`,
        "path": `levels/${level.id}/map.png`,
        "data": "FAST ALL"
      },
      {
        "type": "MAP",
        "id": `${level.id}_map`,
        "path": `levels/${level.id}/map.png`,
        "data": `${level.id}_tileset FAST 0`
      },
      {
        "type": "PALETTE",
        "id": `${level.id}_palette`,
        "path": `levels/${level.id}/map.png`
      },
    ])
  })
  const output = resources.map(resource => {
    return `${resource.type} ${resource.id} "${resource.path}" ${resource.data ? resource.data : ''}`
  }).join('\n')

  await writeFileIfContentChanged('res/resources.res', output)
}

async function writeLevelC(level: Level): Promise<void> {
  const output = `#pragma once
#include "map.h"
#include "resources.h"
#include "stages/level.h"

const u8 ${level.id}_collisionMap[${level.collision.length}][${level.collision[0].length}] = {
  ${level.collision.map(row => {
    return `  {${row.join(',')}}`
  }).join(',\n')}
};

const Level ${level.id}_level = {
  ${level.collision[0].length << 4},
  ${level.collision.length << 4},
  ${level.collision[0].length},
  ${level.collision.length},
  (V2f32){FIX32(${level.startPos.x}),FIX32(${level.startPos.y})},
  ${level.id}_collisionMap,
  &${level.id}_tileset,
  &${level.id}_map,
  &${level.id}_palette
};

`
  await writeFileIfContentChanged(`res/levels/${level.id}/${level.id}.h`, output)
}

const writeLevels = async (levels: Level[]) => {
  const promises = [] as Promise<void>[]
  levels.forEach(level => {
    promises.push(
      // writeLevelH(level),
      writeLevelC(level)
    )
  })
  await Promise.all(promises)
}

(async () => {
  console.log('----------------------------')
  console.log('Generating files from config')
  console.log('----------------------------')

  const levels = (await readObjectsFromGlob<Level>('res/levels/**/map.json')) as Level[]
  await writeLevels(levels)
  await writeResourcesH(levels)
})()





