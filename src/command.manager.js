const commands = new Map();
import setCommand from "./command/set.command.js";
import softCommand from "./command/soft.command.js";
import supportedCommand from "./command/supported.command.js";

commands.set(setCommand.name, setCommand.executor);
commands.set(softCommand.name, softCommand.executor);
commands.set(supportedCommand.name, supportedCommand.executor);

export default commands;
