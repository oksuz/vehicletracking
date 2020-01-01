import { IParser, IMessage } from 'openmts-common';
import loginMessageParser from './LoginMessageParser';
import heartbeatMessageParser from './HeartbeatMessageParser';
import locationMessageParser from './LocationMessageParser';
import alertMessageParser from './AlertMessageParser';

const parsers: IParser<IMessage>[] = [heartbeatMessageParser, locationMessageParser, loginMessageParser, alertMessageParser];

export default parsers;