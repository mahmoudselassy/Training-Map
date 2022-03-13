'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
class workout {
  date = new Date();
  id = (this.date.getTime() + ' ').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; //[lat,lng]
    this.distance = distance; //km
    this.duration = duration; //min
  }
}
class running extends workout {
  constructor(coords, distance, duration, cadance) {
    super(coords, distance, duration);
    this.cadance = cadance;
    this.type = 'running';
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance; //min/km
    return this.pace;
  }
}
class cycling extends workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.type = 'cycling';
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60); //km/h
    return this.speed;
  }
}
class App {
  #workouts = [];
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    /* this._getLocalStorage();*/
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }
  _getPosition() {
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
      alert('location can not be accessed!');
    });
  }
  _loadMap(position) {
    const coords = [position.coords.latitude, position.coords.longitude];
    this.#map = L.map('map').setView(coords, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on('click', this._showForm.bind(this));
    /*this.#workouts.forEach(el => {
      this._renderPopup(el);
    });*/
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _renderPopup(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.type === 'running' ? 'Running' : 'Cycling'} on ${months[workout.date.getMonth()]} ${workout.date.getDate()}`)
      .openPopup();
  }
  _renderWorkout(workout) {
    let isRunning = workout.type === 'running';
    let workoutElement = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${isRunning ? 'Running' : 'Cycling'} on ${months[workout.date.getMonth()]} ${workout.date.getDate()}</h2>
          <div class="workout__details">
            <span class="workout__icon">${isRunning ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${isRunning ? workout.calcPace().toFixed(1) : workout.calcSpeed().toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${isRunning ? '🦶🏼' : '⛰'}</span>
            <span class="workout__value">${isRunning ? workout.cadance : workout.elevationGain}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;

    form.insertAdjacentHTML('afterend', workoutElement);
  }
  _hideForm() {
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);

    inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';
  }
  _moveToPopup(e) {
    const workoutelement = e.target.closest('.workout');
    if (workoutelement instanceof Element) {
      const workoutId = workoutelement.dataset.id;
      const workoutCoords = this.#workouts.find(el => el.id === workoutId).coords;
      this.#map.setView(workoutCoords, 16);
    }
  }
  _newWorkout(e) {
    e.preventDefault();
    let workout;
    const coords = [this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng];
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    const cadance = Number(inputCadence.value);
    const elevation = Number(inputElevation.value);
    const isValidData = distance > 0 && duration > 0 && (cadance > 0 || elevation > 0);
    if (!isValidData) {
      return alert('data should be positive number');
    }
    if (type === 'running') {
      workout = new running(coords, distance, duration, cadance);
    } else if (type === 'cycling') {
      workout = new cycling(coords, distance, duration, elevation);
    }
    this.#workouts.push(workout);
    this._hideForm();
    this._renderPopup(workout);
    this._renderWorkout(workout);
    /*this._setLocalStorage();*/
  }
  /*_setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data);
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(el => {
      this._renderWorkout(el);
    });
  }*/
}

const app = new App();
