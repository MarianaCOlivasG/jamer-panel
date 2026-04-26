import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Pipe({
  name: 'image'
})
export class ImagePipe implements PipeTransform {

  transform( filename: string | undefined, entity: 'employees' | 'products' | 'signatures' | 'work-tools' | 'vehicles' | 'logo' ): string {
    
    if ( !filename ) {
      return `${ baseUrl }/uploads/file/no-image/no-image`;
    } else {
      return `${ baseUrl }/uploads/file/${entity}/${filename}`;
    }

  }

}
