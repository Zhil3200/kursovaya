import { Component, OnInit } from '@angular/core';
import {ModalService} from "../../shared/services/modal.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  dataForCarousel = [
    {
      image: 'assets/images/carousel/1.png',
      category: 'Предложение месяца',
      title: 'Продвижение в Instagram для вашего бизнеса <span>-15%</span>!'
    },
    {
      image: 'assets/images/carousel/2.png',
      category: 'Акция',
      title: 'Нужен грамотный <span>копирайтер </span>?',
      text: 'Весь декабрь у нас действует акция на работу копирайтера.'
    },
    {
      image: 'assets/images/carousel/3.png',
      category: 'Новость дня',
      title: '<span>6 место</span> в ТОП-10 SMM-агенств Москвы!',
      text: 'Мы благодарим каждого, кто голосовал за нас!'
    },
  ];

  constructor(private modalService: ModalService) { }

  ngOnInit(): void {
  }

  openModal(value: string) {
    this.modalService.show('order', value, 'Заявка на услугу', 'Оставить заявку');
  }

}
