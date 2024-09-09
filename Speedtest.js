import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { request } from 'undici';

class Speedtest {

    /**
     * @constructor
     * @param {Object} [options={}] - The options object to configure the instance.
     * @param {string} [options.serverId] - The server ID that was used to perform the speed test.
     * @param {number} [options.ping] - The ping value in milliseconds.
     * @param {number} [options.uploadMbps] - The upload speed in megabits per second (Mbps).
     * @param {number} [options.downloadMbps] - The download speed in megabits per second (Mbps).
     * @param {number} [options.downloadPing] - The ping during download in milliseconds.
     * @param {number} [options.uploadPing] - The ping during upload in milliseconds.
     * @param {number} [options.idleLatency] - The latency when the connection is idle in milliseconds.
     */
    constructor(options = {}) {
        this.serverId = options.serverId;
        this.ping = options.ping;
        this.uploadMbps = options.uploadMbps;
        this.downloadMbps = options.downloadMbps;
        this.downloadPing = options.downloadPing;
        this.uploadPing = options.uploadPing;
        this.idleLatency = options.idleLatency;

        const key = '817d699764d33f89c'; // May change
        const toHash = [this.ping || 0, this.uploadMbps || 0, this.downloadMbps || 0, key].join('-')
        this.hashedResults = crypto.createHash('md5').update(toHash).digest('hex');
        // {
        //     key: '_calculateResultHash',
        //     value: function(e) {
        //         return (0,
        //         r.default)([e.ping || 0, e.upload || 0, e.download || 0, '817d699764d33f89c'].join('-'))
        //     }
        // }
    }

    createPayload() {
        return {
            'app': {
                'sdk': {
                    'commit': 'f6b050be7bf06ca243f95e60eafff740cc401b9a', // Static
                    'version': '2.8.17'
                }
            },
            'serverid': this.serverId,
            'testmethod': 'wss,xhrs,xhrs',
            'source': 'st4-js',
            'configs': {
                'remoteDebugging': false,
                'maxDisplayServers': 20,
                'requestWebLocation': true,
                'shortTests': false,
                'automaticStageProgression': false,
                'eventSkipInterval': 2,
                'latency': {
                    'maxServers': 10
                },
                'jsEngine': {
                    'saveContentType': 'application/json',
                    'saveType': 'st4-js'
                },
                'stagesList': [
                    'latency',
                    'download',
                    'upload',
                    'save'
                ],
                'loadedLatency': {
                    'enabled': true
                },
                'swf': {
                    'engine': '/engine.swf',
                    'express': '/expressInstall.swf'
                },
                'vpnDetected': false,
                'logErrorsToServer': false,
                'connections': {
                    'isVpn': false,
                    'selectionMethod': 'auto',
                    'mode': 'multi'
                },
                'experiments': {},
                'latencyProtocol': 'ws',
                'downloadProtocol': 'xhr',
                'uploadProtocol': 'xhr',
                'host': 'speedtest1.20i.com.prod.hosts.ooklaserver.net',
                'port': 8080,
                'serverVersion': '2.11.0',
                'serverBuild': '2023-11-29.2207.3251a05'
            },
            'ping': this.ping,
            'pings': [],
            'jitter': 0,
            'latency': {
                'connectionProtocol': 'wss',
                'tcp': {
                    'jitter': 0,
                    'rtt': {
                        'iqm': this.idleLatency,
                        'mean': this.idleLatency,
                        'median': this.idleLatency,
                        'min': this.idleLatency,
                        'max': this.idleLatency
                    },
                    'count': 0,
                    'samples': []
                }
            },
            'guid': uuid(),
            'serverSelectionMethod': 'auto',
            'uploadMeasurementMethod': 'remote',
            'upload': this.uploadMbps,
            'uploadSpeeds': {},
            'download': this.downloadMbps,
            'downloadSpeeds': {},
            'downloadLatency': {
                'tcp': {
                    'jitter': 0,
                    'rtt': {
                        'iqm': this.downloadPing,
                        'mean': this.downloadPing,
                        'median': this.downloadPing,
                        'min': this.downloadPing,
                        'max': this.downloadPing
                    },
                    'count': 0,
                    'elapsed': 0,
                    'timestamp': 0
                }
            },
            'uploadLatency': {
                'tcp': {
                    'jitter': 0,
                    'rtt': {
                        'iqm': this.uploadPing,
                        'mean': this.uploadPing,
                        'median': this.uploadPing,
                        'min': this.uploadPing,
                        'max': this.uploadPing
                    },
                    'count': 0,
                    'elapsed': 0,
                    'timestamp': 0
                }
            },
            'servers': {},
            'connections': {},
            'hash': this.hashedResults,
            'clientip': '8.8.8.8',
            'serverSelection': {}
        }
    }

    async fakeResults() {
        try {
            const response = await request('https://www.speedtest.net/api/results.php', {
                method: 'POST',
                headers: {
                    host: 'www.speedtest.net',
                    connection: 'keep-alive',
                    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Brave";v="128"',
                    accept: 'application/json, text/plain, */*',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-ch-ua-mobile': '?0',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                    'content-type': 'application/json;charset=UTF-8',
                    'sec-gpc': '1',
                    'accept-language': 'en-GB,en;q=0.7',
                    origin: 'https://www.speedtest.net',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-dest': 'empty',
                    referer: 'https://www.speedtest.net/',
                },
                body: JSON.stringify(
                    this.createPayload()
                )
            })

            const body = await response.body.json();
            const resultId = body?.resultid;
            if(!resultId)
                throw new Error(`Failed to get fake results. Missing result | ${JSON.stringify(body)} (${response.statusCode})`);

            return { resultId, hashKey: body.hash_key_id };
        } catch (e) {
            return { error: true, message: e.message }
        }
    }
}

export default Speedtest;