
const regex = /【睡前消息(\d{1,4})期?】/

// load watch
export const listen = function(data) {
  const title = data.archives[0].title
  if (regex.test(title)) {
    const [full, index] = regex.exec(title)
    const indexNum = parseInt(index)
    let rangeStart = Math.floor(indexNum / 100) * 100 + 1
    if (indexNum % 100 === 0) {
      rangeStart = (Math.floor(rangeStart / 100) - 1) * 100 + 1
    }
    const rangeEnd = rangeStart + 99
    const range = `${String(rangeStart).padStart(4, '0')}_${String(rangeEnd).padStart(4, '0')}`
    return {
      filepath: `docs/btnews/${range}/btnews_${index}.md`,
    }
  }
}

export const template = function(data) {
  if(regex.test(data.title)) {
    const [full, index] = regex.exec(data.title)
    const indexNum = parseInt(index)
    let rangeStart = Math.floor(indexNum / 100) * 100 + 1
    if (indexNum % 100 === 0) {
      rangeStart = (Math.floor(rangeStart / 100) - 1) * 100 + 1
    }
    const rangeEnd = rangeStart + 99
    const range = `${String(rangeStart).padStart(4, '0')}_${String(rangeEnd).padStart(4, '0')}`
    return {
      filepath: `docs/btnews/${range}/btnews_${index}.md`,
    }
  }
  return {}
}