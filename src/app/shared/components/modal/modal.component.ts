import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {ModalService} from "../../services/modal.service";
import {RequestsService} from "../../services/requests.service";
import {HttpErrorResponse} from "@angular/common/http";
import {Subscription} from "rxjs";
import {MessageService} from "primeng/api";
import {ErrorResponseService} from "../../services/error-response.service";
import {DefaultResponseType} from "../../../../types/default-response.type";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {

  visibleModal: boolean = false;

  visibleBlock: boolean = true;
  title: string = '';
  type: string = '';
  service: string = '';
  buttonText: string = '';

  private subs: Subscription = new Subscription();
  modal = this.fb.group({
    service: [''],
    name: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/)]],
  })

  constructor(private fb: FormBuilder,
              private modalService: ModalService,
              private requestsService: RequestsService,
              private messageService: MessageService,
              private errorResponseService:ErrorResponseService) {
  }

  ngOnInit(): void {
    this.subs.add(this.modalService.isShowed$.subscribe((isShowed: boolean): void => {
      this.visibleModal = isShowed;
    }));

    this.subs.add(this.modalService.modalData$.subscribe((data: { type: string, service: string, title: string, buttonText: string }): void => {
      this.modal.get('service')?.patchValue(data.service);
      this.type = data.type;
      this.service = data.service;
      this.title = data.title;
      this.buttonText = data.buttonText;
    }));
  }

  closeModal() {
    this.modalService.hide();
    this.visibleBlock = true;

    this.modal.reset();
    this.modal.get('service')?.patchValue(this.service);

  }

  send(): void {
    if (this.modal.valid && this.modal.value.name && this.modal.value.phone && this.modal.value.service) {

      this.requestsService.requests(this.modal.value.name, this.modal.value.phone,
        this.type, this.modal.value.service)
        .subscribe({
          next: (data: DefaultResponseType): void => {
            let error = null;

            if (data.error) {
              error = (data as DefaultResponseType).message;
            }

            if (error) {
              this.messageService.add({severity: 'error', summary: 'Ошибка', detail: error});
              throw new Error(error);
            }

            this.visibleBlock = false;
            this.modal.reset();
            this.modal.get('service')?.patchValue(this.service);

            setTimeout((): void => {
              if (!this.visibleBlock) {
                this.visibleBlock = true;
              }
            }, 7000);
          },
          error: (errorResponse: HttpErrorResponse): void => {
            this.errorResponseService.errorResponse(errorResponse,'Ошибка отправки')
          }
        });
    }
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
