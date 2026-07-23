import "dotenv/config";
import { createServer } from "node:http";
import { mongooseConnect } from "./server";
import { redisConnect } from "./redis";
import { createApp } from "./app";
import { attachSocket } from "./socket";
import * as composition from "./composition";

const port = process.env.PORT ?? 3000;

const run = async () => {
  try {
    await mongooseConnect();
    await redisConnect();
    const app = createApp(composition);
    const server = createServer(app);
    attachSocket(
      server,
      composition.verifyAccessTokenService,
      composition.addUserToRoomsService,
      composition.messagingControllers,
      composition.userConnectedService,
      composition.userDisconnectedService,
    );
    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
};

run();
