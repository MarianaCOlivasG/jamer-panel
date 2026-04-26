import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Compressor from 'compressorjs';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class WorkOrdersSolutionsService {

  
  constructor( private http: HttpClient ) { }

  getById(workOrderId: number) {
    return this.http.get<any>(`${baseUrl}/work-orders-solutions/details/${workOrderId}`);
  }

   create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/work-orders-solutions/create`, formData);
  }

  update( workOrderId: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/work-orders-solutions/update/${workOrderId}`, formData);
  }
  uploadFile(id: number, file: File, progressCallback?: (progress: number) => void): Observable<any> {
    return new Observable(observer => {
      this.compressImage(file).then(compressedFile => {
        const formData: FormData = new FormData();
        formData.append('file', compressedFile, compressedFile.name);
  
        this.http.put(`${baseUrl}/uploads/work-order/${id}`, formData, {
          reportProgress: true,
          observe: 'events'
        }).subscribe({
          next: (event) => { 
            if (event.type === HttpEventType.UploadProgress) {
              const progress = Math.round(100 * event.loaded / (event.total || 1));
              if (progressCallback) progressCallback(progress);
            }
            else if (event instanceof HttpResponse) {
              observer.next(event.body);
              observer.complete();
            }
          },
          error: (err) => observer.error(err)
        });
      }).catch(err => observer.error(err));
    });
  }
  private compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        new Compressor(file, {
            quality: 0.65,       // Calidad ajustable (65%)
            maxWidth: 1600,       // Ancho máximo
            maxHeight: 900,       // Alto máximo
            convertSize: 0,       // Forzar conversión sin importar el tamaño
            mimeType: 'image/jpeg', // Siempre convertir a JPEG
            success(result) {
                // Cambiar la extensión del nombre de archivo a .jpg
                const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                const newFileName = `${fileNameWithoutExt}.jpg`;

                // Convertir Blob a File con el nuevo nombre y tipo JPEG
                const compressedFile = new File([result], newFileName, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });
                resolve(compressedFile);
            },
            error(err) {
                console.error('Error de compresión:', err);
                // En caso de error, enviar el original pero convertido a JPEG
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.min(img.width, 1600);
                        canvas.height = Math.min(img.height, 900);
                        const ctx = canvas.getContext('2d')!;
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        canvas.toBlob((blob) => {
                            const newFileName = file.name.replace(/\.[^/.]+$/, ".jpg");
                            const jpegFile = new File([blob!], newFileName, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(jpegFile);
                        }, 'image/jpeg', 0.65);
                    };
                    img.src = event.target!.result as string;
                };
                reader.readAsDataURL(file);
            }
        });
    });
}



}
