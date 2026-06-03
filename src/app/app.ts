import { Component, signal } from '@angular/core';
import { Dashboard } from "../features/dashboard/dashboard/dashboard";
import { SideBar } from "../shared/side-bar/side-bar";
import {  RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Money-Management');
}
