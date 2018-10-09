/// <reference types="@types/googlemaps" />

export class Popup extends google.maps.OverlayView {

  anchor: any;
  pixelOffset: any;

  constructor(private position: google.maps.LatLng, private content: HTMLElement) {
    super();
    this.content.classList.add('popup-bubble-content');
    this.pixelOffset = document.createElement('div');
    this.pixelOffset.classList.add('popup-bubble-anchor');
    this.pixelOffset.appendChild(this.content);
    this.anchor = document.createElement('div');
    this.anchor.classList.add('popup-tip-anchor');
    this.anchor.appendChild(this.pixelOffset);

    // Optionally stop clicks, etc., from bubbling up to the map.
    this.stopEventPropagation();
  }

  /** Called when the popup is added to the map. */
  onAdd() {
    this.getPanes().floatPane.appendChild(this.anchor);
  }

  /** Called when the popup is removed from the map. */
  onRemove() {
    if (this.anchor.parentElement) {
      this.anchor.parentElement.removeChild(this.anchor);
    }
  }

  /** Called when the popup needs to draw itself. */
  draw() {
    let divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
    // Hide the popup when it is far out of view.
    let display = Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ? 'block' : 'none';
    if (display === 'block') {
      this.anchor.style.left = divPosition.x + 'px';
      this.anchor.style.top = divPosition.y + 'px';
    }
    if (this.anchor.style.display !== display) {
      this.anchor.style.display = display;
    }
  }

  /** Remove existing popup container from DOM */
  destroy() {
    this.anchor.remove();
  }

  /** Stops clicks/drags from bubbling up to the map. */
  stopEventPropagation() {
    this.anchor.style.cursor = 'auto';
    ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart', 'pointerdown']
    .forEach(event=> {
      this.anchor.addEventListener(event, (e)=> {
        e.stopPropagation();
      });
    });
  }
}
