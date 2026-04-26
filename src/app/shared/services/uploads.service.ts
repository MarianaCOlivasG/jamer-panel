import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;


@Injectable({
  providedIn: 'root'
})
export class UploadsService {

  constructor( private http: HttpClient ) { }

  
  uploadPicture( employeeId: number, file: File ) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name );
    return this.http.put( `${ baseUrl }/uploads/picture/${ employeeId }`, formData, { reportProgress: true } )
  }

  uploadImage( entity: 'products' | 'work-tools' | 'vehicles', id: number, file: File ) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name );
    return this.http.put( `${ baseUrl }/uploads/image/${entity}/${ id }`, formData, { reportProgress: true } )
  }


  uploadPFileEmployee( employeeId: number, file: File ) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name );
    return this.http.put( `${ baseUrl }/uploads/employee/p-file/${ employeeId }`, formData, { reportProgress: true } )
  }


  uploadPFileProduct( productId: number, file: File ) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name );
    return this.http.put( `${ baseUrl }/uploads/product/p-file/${ productId }`, formData, { reportProgress: true } )
  }


  uploadPolicyFile( vehicleId: number, file: File ) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name );
    return this.http.put( `${ baseUrl }/uploads/vehicles/${ vehicleId }`, formData, { reportProgress: true } )
  }

  uploadCustomerCSFFile( customerId: number, file: File ) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name );
    return this.http.put( `${ baseUrl }/uploads/customer/csf/${ customerId }`, formData, { reportProgress: true } )
  }


  uploadBPurchasePay( payId: number, file: File ) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name );
    return this.http.put( `${ baseUrl }/uploads/b-purchas-pay/${ payId }`, formData, { reportProgress: true } )
  }

  uploadCobranza( cobranzaId: number, file: File ) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name );
    return this.http.put( `${ baseUrl }/uploads/cobranza/${ cobranzaId }`, formData, { reportProgress: true } )
  }

  uploadCobranzaSale( cobranzaId: number, file: File ) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name );
    return this.http.put( `${ baseUrl }/uploads/cobranza-sale/${ cobranzaId }`, formData, { reportProgress: true } )
  }



  uploadFacturas( customerId: number, files: File[] ) {
    const formData: FormData = new FormData();
    files.forEach( file => {
      formData.append('files', file, file.name);
    });
    return this.http.put( `${ baseUrl }/uploads/customer/facturas/${ customerId }`, formData, { reportProgress: true } )
  }

}
