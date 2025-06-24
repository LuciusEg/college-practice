import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AppService {
  constructor(
  ){}
  getHello(res : Response){
    const data = {
      message : "1",
      number : "123"
    }
    res.json(data)
    res.end()
  }
}
