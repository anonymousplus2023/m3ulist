// import pornhub from '@justalk/pornhub-api';
// import { fileURLToPath } from 'url';

// // const __filename = fileURLToPath(import.meta.url);

// import {
//   Worker, isMainThread, parentPort, workerData
// } from 'node:worker_threads';
import axios from 'axios'

const CATEGORY_ALIAS = {
  MOST_VIEWED: 'mv',
	HOTTEST: 'ht&cc=ua',
	TOP_RATED: 'tr'
}

export const getCategory = async (category, pages) => {
// const videos = await pornhub.video(['title', 'link'], { filter: category, page: pages })
// console.log('videos.results length', videos.results.length)
// return videos


  const o = CATEGORY_ALIAS[category] ? CATEGORY_ALIAS[category] : category

  const allVideos = []
  const allKeys = new Set()

  for (var i = 0; i < pages; i++) {
    const videos = await getCategoryItems(`https://www.pornhub.com/video?o=${o}&page=${i + 1}`)
    if (videos && videos.results) {
      
      for (const video of videos.results) {
        if (allKeys.has(video.link)) { continue }
  
        allKeys.add(video.link)

        allVideos.push(video)
      }
    }
  }

  return {
    results: allVideos
  }
}

const getCategoryItems = async (url) => {
  console.log('>>>>> URL', url)
  let t1 = Date.now()

  let source
  try {
    const res = await axios.get(url)
    source = res.data
  } catch (error) {
    console.log('getCategoryItems error', error)
    return
  }


  console.log(`get TOOK ${Date.now() - t1} ms`)
  t1 = Date.now()

  const matches = source.split('\n')

  console.log(`match TOOK ${Date.now() - t1} ms`)
  t1 = Date.now()

  const items = [];
  for (const match of matches) {

    if (!match.includes('viewkey') || !match.includes('title')) { continue }

    try {
      const [_, key, title] = match.match(/.*viewkey=(.*)\" title=\"(.*)\" class=\"/)

      items.push({
        title,
        link: `https://www.pornhub.com/view_video.php?viewkey=${key}`
      })

    } catch (error) {
      
    }
  }
  console.log(`extractRegex TOOK ${Date.now() - t1} ms`)
  
    return {
      results: items
    }
}

export const getVideoUrls = async (url) => {
  let t1 = Date.now();

  let source;
  try {
    const res = await axios.get(url);
    source = res.data;
  } catch (error) {
    console.log("getVideoUrls error", error);
    return;
  }

  console.log(`getVideoUrls: get TOOK ${Date.now() - t1} ms`);

  t1 = Date.now();

  let rsl = {};

  if (true) {
    t1 = Date.now();
    source = source.match(/var flashvars_.* = ({.*);$/m)[1];
    console.log(`getVideoUrls: limitedSource TOOK ${Date.now() - t1} ms`);

    const data = JSON.parse(source);
    const download_urls = data.mediaDefinitions.reduce((acc, d) => {
      acc[`${d.quality}P`] = d.videoUrl;
      return acc;
    }, {});

    console.log(">>> download_urls", download_urls);

    return { download_urls };
  }
};

// export const getTaskWorker = (task) => {
//   return new Promise((resolve, reject) => {
//     const worker = new Worker(__filename, {
//       workerData: task
//     });
//     worker.on('message', resolve);
//     worker.on('error', reject);
//     worker.on('exit', (code) => {
//       if (code !== 0)
//         reject(new Error(`Worker stopped with exit code ${code}`));
//     });
//   });
// }

// export const createTaskCategory = (category, pages) => JSON.stringify({
//   type: 'category',
//   data: { category, pages }
// })

// export const createTaskVideo = (url) => JSON.stringify({
//   type: 'video',
//   data: { url }
// })

// if (!isMainThread) {
//   const task = JSON.parse(workerData);
//   const { type } = task

//   const main = async () => {
//     if (type === 'category') {
//       try {
//         const videos = await getCategory(task.data.category, task.data.pages)
//         parentPort.postMessage(videos);

//         console.log('FETCHED', task.data.category)
//       } catch (error) {
//         parentPort.postMessage(undefined);
//       }
//     } else if (type === 'video') {
//       try {
//         // const video = await pornhub.page(task.data.url, ['download_urls']);
//         const video = await getVideoUrls(task.data.url);
//         parentPort.postMessage(video);
//         console.log('FETCHED', task.data.url)
//       } catch (error) {
//         parentPort.postMessage(undefined);
//       }
//     }
//   }
//   main()
// }
