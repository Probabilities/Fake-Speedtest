import Speedtest from './Speedtest.js';

const test = new Speedtest({
    serverId: 33216, // London FibreNest
    ping: 12,
    uploadMbps: 2000000,
    downloadMbps: 2000000,
    downloadPing: 666,
    uploadPing: 666,
    idleLatency: 666
})

const result = await test.fakeResults()
console.log(result)

console.log(`https://speedtest.net/result/${result.resultId}.png`)