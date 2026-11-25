/**
 * Native Node.js Request Body Parser
 * Reads stream chunks safely with size constraints and JSON parsing.
 */

const MAX_PAYLOAD_BYTES = 512 * 1024; // 512 KB

/**
 * Parses JSON body from incoming HTTP request stream
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<any>}
 */
export function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let rawData = '';
    let bytesReceived = 0;

    req.on('data', (chunk) => {
      bytesReceived += chunk.length;
      if (bytesReceived > MAX_PAYLOAD_BYTES) {
        req.destroy();
        reject(new Error('Payload too large: maximum allowed size is 512KB'));
        return;
      }
      rawData += chunk;
    });

    req.on('end', () => {
      if (!rawData || rawData.trim() === '') {
        resolve({});
        return;
      }

      try {
        const parsed = JSON.parse(rawData);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON format in request body'));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}
