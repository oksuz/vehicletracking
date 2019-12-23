import loginMessageParser from './LoginMessageParser';
import heartbeatMessageParser from './HeartbeatMessageParser';
import { IParser } from 'openmts-common';

const parsers: IParser[] = [loginMessageParser, heartbeatMessageParser];

export default parsers;