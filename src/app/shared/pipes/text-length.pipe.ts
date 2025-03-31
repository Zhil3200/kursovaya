import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'textLength'
})
export class TextLengthPipe implements PipeTransform {
  transform(text: string, textLength: number): string {
    let result: string = '';
    if (text.length <= textLength) {
      result = text;
    } else if (text.length > textLength) {
      result = text.slice(0, textLength) + '...';
    }
    return result;
  }
}
