import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

interface ApiSuccess<T> {
  success: true;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiOrigin + '/api/feedback';

  sendFeedback(message: string, images: File[]): Observable<{ sent: true }> {
    const formData = new FormData();
    formData.append('message', message);
    images.forEach((file) => formData.append('images', file));

    return this.http
      .post<ApiSuccess<{ sent: true }>>(this.apiUrl, formData, { withCredentials: true })
      .pipe(map((res) => res.data));
  }
}
