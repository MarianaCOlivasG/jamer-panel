import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MarkerGoogle } from '../../interfaces/marker-google.interface';

declare const google: any; 

@Component({
  selector: 'google-map-addresses',
  templateUrl: './map-addresses.component.html',
  styleUrls: ['./map-addresses.component.scss']
})
export class MapAddressesComponent implements OnInit {



  // lat: 21.1207331,
  // lng: -86.8839398
  @Input() markers: MarkerGoogle[] = [];
  @Output() newLatLng = new EventEmitter<{ lat: number, lng: number }>();


  ngOnInit(): void {
    this.initMap(this.markers[0].position)
  }


  async initMap( position: { lat: number, lng: number }){

    const { Map } = await google.maps.importLibrary("maps");
  
    const map = new Map(document.getElementById('map'), {
      center: position,
      zoom: 15,
    });
  
    this.addMarker(map, this.markers);
    
    this.newLatLng.emit(position);

  }


  addMarker( map: any , markers: MarkerGoogle[] ) {

    markers.forEach( ( m: MarkerGoogle ) => {

      const infowindow = new google.maps.InfoWindow({
        content: m.content,
        ariaLabel: "Uluru",
      });

      const marker = new google.maps.Marker({
        position: m.position,
        draggable: true,

      });
  
      marker.setMap(map);

      marker.addListener('drag', ( event: any ) => {
        this.newLatLng.emit({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      });
      marker.addListener('dragend', ( event: any ) => {
        this.newLatLng.emit({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      });

      marker.addListener("click", () => {
        infowindow.open({
          anchor: marker,
          map,
        });
      });

    });

  }


}

