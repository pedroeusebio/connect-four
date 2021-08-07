import { useHistory, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const useUnload = (fn) => {
  const cb = useRef(fn);

  useEffect(() => {
    const onUnload = cb.current;
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [cb]);
};

export default function Game({ socket }) {
  const { id } = useParams();
  let history = useHistory();
  const [isConnected, setIsConnected] = useState(false);

  const disconnect = () => {
    socket.emit("user:disconnect", { id }, (res) => {
      if ("error" in res) {
        return alert(res.error);
      }
      console.log("disconnected");
      setIsConnected(false);
    });
  };

  useUnload(disconnect);

  useEffect(() => {
    socket.emit("user:connect", { id }, (res) => {
      if ("error" in res && res.error === "user already connected") {
        alert(res.error);
        return history.push("/");
      }
      console.log("connected");
      setIsConnected(true);
    });

    return () => disconnect();
  }, []);

  return <h2> Player {id}</h2>;
}
