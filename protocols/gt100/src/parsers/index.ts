import loginMessageParser from './LoginMessageParser';
import heartbeatMessageParser from './HeartbeatMessageParser';
import locationMessageParser from './LocationMessageParser';
import { IParser } from 'openmts-common';

const parsers: IParser[] = [heartbeatMessageParser, locationMessageParser, loginMessageParser];

export default parsers;