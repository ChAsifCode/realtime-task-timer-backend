import { getIO } from "../../socket.js";
export default function attachIO(req, _res, next) {
  req.io = getIO();
  next();
}
