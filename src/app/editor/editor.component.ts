import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import MediumEditor from 'medium-editor';
import { debounceTime } from 'rxjs/operators';
import { fromEvent, Subscription } from 'rxjs';
import { DatabaseService } from '../services/database.service';
import { DomSanitizer } from '@angular/platform-browser';
import { replace } from 'unicodeit';

declare const MathJax: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.sass'],
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('medium') medium: ElementRef;

  editor: MediumEditor

  sub = new Subscription()

  userText$ = this.dbService.getUserText();

  constructor(private dbService: DatabaseService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  ngAfterViewInit() {
    const edit = this.medium.nativeElement;
    this.editor = new MediumEditor(edit);
    this.userText$.subscribe(text => {
      this.editor.setContent(text);

    });
    this.sub.add(
      fromEvent(edit, 'input')
        .pipe(debounceTime(500))
        .subscribe(() => {
          this.editor.saveSelection();
          edit.innerHTML = this.replaceEquations(edit.innerHTML);
          this.editor.trigger('valueChanged', edit.innerHTML, edit);
          this.editor.restoreSelection();
        })
    );

    this.sub.add(
    this.editor.subscribe('valueChanged', async text =>
      await this.dbService.saveUserDoc(text))
    );
  }

  replaceEquations(textInput){
    return textInput
      .replace(/<span class="equation">\s*<\/span>/)  //replace empty markup
      .replace(/\$(.*?)\$/gmi, text =>                //replace $.....$
      text.length > 2 ?
      replace(`<span class="equation">${text.slice(1, text.length - 1)}</span>&nbsp;`) : //unicode replace
      text);
  }

}
