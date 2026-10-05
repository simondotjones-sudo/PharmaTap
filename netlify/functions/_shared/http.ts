import {Fault} from './service';
export function guard(req:Request){
 if(req.method!=='GET'){
  if(req.headers.get('origin')!==new URL(req.url).origin)throw new Fault(403,'Request origin is not allowed.');
  if(!req.headers.get('content-type')?.startsWith('application/json'))throw new Fault(415,'Use JSON for submissions.');
 }
}
