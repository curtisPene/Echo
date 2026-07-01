import { DefaultEventsMap, Socket } from "socket.io";

type AuthenticatedSocket = Socket & { data: { user: { id: string } } };

type AckFunction = (response: unknown) => void;

type SocketHandler<TPayload = unknown, TAck = unknown> = ({
  socket,
  payload,
  ack,
}: {
  socket: AuthenticatedSocket;
  payload: TPayload;
  ack: (response: TAck) => void;
}) => void | Promise<void>;

export const withAuth = <TPayload, TAck>({
  socket,
  handler,
}: {
  socket: Socket;
  handler: SocketHandler<TPayload, TAck>;
}) => {
  console.log("foo");
  return (payload: TPayload, ack: (response: TAck) => void) => {
    if (!socket.data?.userId) {
      return;
    }
    handler({ socket: socket as AuthenticatedSocket, payload, ack });
  };
};
