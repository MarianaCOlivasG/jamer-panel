import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

declare const google: any; 

@Component({
  selector: 'google-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {


  // lat: 21.1207331,
  // lng: -86.8839398
  @Input() position:  { lat: number, lng: number } = { lat: 21.1207331, lng:-86.8839398 };
  @Output() newLatLng = new EventEmitter<{ lat: number, lng: number }>();


  ngOnInit(): void {
    this.initMap(this.position)
  }


  async initMap( position: { lat: number, lng: number }){

    const { Map } = await google.maps.importLibrary("maps");
  
    const map = new Map(document.getElementById("map"), {
      center: position,
      zoom: 15,
    });
  
    const marker = new google.maps.Marker({
      position,
      draggable: true,
    });

    marker.setMap(map);
    
    this.newLatLng.emit(position);

    marker.addListener('drag', ( event: any ) => {
      this.newLatLng.emit({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    });
    marker.addListener('dragend', ( event: any ) => {
      this.newLatLng.emit({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    });

  }


}
