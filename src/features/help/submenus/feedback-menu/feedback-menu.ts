import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { ToastService } from '../../../../core/services/toast.service';
import { extractErrorMessage } from '../../../../core/utils/api-error';
import { IconComponent } from '../../../../shared/icons/icons.component';

interface AttachmentPreview {
  file: File;
  url: string;
}

@Component({
  selector: 'feedback-menu',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './feedback-menu.html',
  styleUrl: './feedback-menu.css',
})
export class FeedbackMenu {
  private fb = inject(FormBuilder);
  private feedbackService = inject(FeedbackService);
  private toast = inject(ToastService);

  readonly maxAttachments = 5;
  private readonly maxFileSizeMB = 5;

  isSubmitting = signal(false);
  attachments = signal<AttachmentPreview[]>([]);

  feedbackForm: FormGroup = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  get message() { return this.feedbackForm.get('message')!; }

  messageClass(): string {
    const base = 'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-y';
    return this.message.invalid && this.message.touched
      ? `${base} border-red-300 bg-red-50 focus:ring-red-200`
      : `${base} border-gray-200 focus:border-indigo-400 focus:ring-indigo-100 bg-white`;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;

    const remainingSlots = this.maxAttachments - this.attachments().length;
    if (remainingSlots <= 0) {
      this.toast.error(`You can attach up to ${this.maxAttachments} images.`);
      return;
    }

    const accepted: AttachmentPreview[] = [];
    for (const file of files.slice(0, remainingSlots)) {
      if (!file.type.startsWith('image/')) {
        this.toast.error(`"${file.name}" is not an image.`);
        continue;
      }
      if (file.size > this.maxFileSizeMB * 1024 * 1024) {
        this.toast.error(`"${file.name}" exceeds ${this.maxFileSizeMB}MB.`);
        continue;
      }
      accepted.push({ file, url: URL.createObjectURL(file) });
    }
    this.attachments.update((list) => [...list, ...accepted]);
  }

  removeAttachment(index: number): void {
    const item = this.attachments()[index];
    if (item) URL.revokeObjectURL(item.url);
    this.attachments.update((list) => list.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const message = this.feedbackForm.value.message as string;
    const files = this.attachments().map((a) => a.file);

    this.feedbackService.sendFeedback(message, files).subscribe({
      next: () => {
        this.toast.success('Thanks! Your feedback has been sent.');
        this.feedbackForm.reset();
        this.attachments().forEach((a) => URL.revokeObjectURL(a.url));
        this.attachments.set([]);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.toast.error(extractErrorMessage(err, 'Could not send feedback. Please try again.'));
        this.isSubmitting.set(false);
      },
    });
  }
}
