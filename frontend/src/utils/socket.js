import { io } from "socket.io-client";

const socket = io("http://localhost:7000"); // replace with your backend URL
export default socket;
