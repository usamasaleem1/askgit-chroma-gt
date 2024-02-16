import * as io from 'socket.io-client';

// Store sockets in memory
const sockets: { [key: string]: io.Socket } = {};

export async function getPredictionReadableFromFlowise(chatflowid: string, sessionid: string, text: string): Promise<ReadableStream> {
  let socket: io.Socket;

  // Create a unique key for each chatflowid and sessionid
  const socketKey = `${chatflowid}-${sessionid}`;

  // Check if socket exists in memory
  if (sockets[socketKey]) {
    socket = sockets[socketKey];
    console.log("socket already exists");
    let newStream = createStreamOfSocket2(socket);
    // Call streamAPrediction again if socket is from memory
    await streamAPrediction(socket.id || "", chatflowid, sessionid, text);
    return newStream;
  } else {
    // If no socket exists, create a new one
    socket = io.connect('https://flow.nagrao.com');
    console.log("new socket created");
    // Store the socket in memory only after it connects
    // Assuming connect will get called only after createStream below is done
    socket.on('connect', async () => {
      sockets[socketKey] = socket;
      // Call streamAPrediction once socket is connected
      await streamAPrediction(socket.id || "", chatflowid, sessionid, text);
    });
    socket.on('end', () => {
      // remove from memory
      delete sockets[socketKey];
    });
    return createStreamOfSocket2(socket);
  }
}

function createStreamOfSocket2(socket) {
  let newStream:ReadableStream = new ReadableStream({
    start(controller) {
      socket.on('token', (chunk) => {
        // console.log("token received");
        controller.enqueue(chunk);
      });

      socket.on('sourceDocuments', (sourceDocuments: any) => {
        // TODO - later controller.enqueue(JSON.stringify(sourceDocuments));
        // console.log("received sourceDocs");
        // TODO - support sourceDocuments
      });

      socket.on('end', () => {
        controller.close();
      });
    }
  });
  return newStream;
}

// function createStreamOfSocket(socket) {
//   let controller;
//   const stream = new ReadableStream({
//     start(c) {
//       controller = c;
//     },
//     pull() {
//       socket.on('start', () => {
//         // TODO - controller.enqueue('start');
//       });

//       socket.on('token', (token: string) => {
//         controller.enqueue(token);
//       });

//       socket.on('sourceDocuments', (sourceDocuments: any) => {
//         // TODO - later controller.enqueue(JSON.stringify(sourceDocuments));
//       });

//       socket.on('end', () => {
//         controller.close();
//       });
//     }
//   });

//   return stream;
// }

async function streamAPrediction(socketid: string, chatflowid: string, sessionid: string, text: string): Promise<void> {
  const response = await fetch(`https://flow.nagrao.com/api/v1/prediction/${chatflowid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      socketIOClientId: socketid,
      overrideConfig: {
        sessionId: sessionid
      },
      question: text
    })
  });
  const result: any = await response.json();
  // console.log("got result from http fetch");
}

// makeRequest("dcea9f3b-8be6-4565-ae0d-bbe1ecb81b79", "dummy", "which company is this?");
