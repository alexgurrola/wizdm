import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NavigatorService } from '../../navigator';

@Component({
  selector: 'wm-static',
  templateUrl: './static.component.html',
  styleUrls: ['./static.component.scss'],
  host: { 'class': 'wm-page adjust-top content-padding' }
})
export class StaticComponent {

  readonly document$: Observable<string>;
  
  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, readonly nav: NavigatorService) {

    // Streams the requested document
    this.document$ = this.streamDocument();
  }

  private get language$(): Observable<string> {
    return this.route.data.pipe( map( data => data.lang || 'en' ) );
  }
 
  private streamDocument(): Observable<string> {

    const defaultLang = 'en';

    // Resolves the requested document name first
    return this.route.paramMap.pipe(
      // Maps the name from the params map
      map( param => param.get('name') ),
       // Resolves the current language
      switchMap( name => this.language$.pipe(
        // Loads the file from the assets
        switchMap( lang => {

          const fullPath = `assets/docs/${lang}/${name}.md`;

          console.log('Statically loading:', fullPath);
          
          // Loads the requested file first
          return this.http.get(fullPath, { responseType: 'text' }).pipe( 
            // Catches the possible error
            catchError( (e: HttpErrorResponse) => {
              // On file not found (404) of localized content...
              if(lang !== defaultLang && e.status === 404) { 
                
                const defaultPath = `assets/docs/${defaultLang}/${name}.md`;
                
                console.log('404 File not found, reverting to default language:', defaultPath);
                
                // Loads the same document in the default language instead
                return this.http.get(defaultPath, { responseType: 'text' });
              }

              console.log('404 File not found, redirecting to not-found');
              
              // Redirects to NotFound when no content is found
              return this.router.navigate(['../not-found'], { relativeTo: this.route }).then( () => ''); 
            })
          );
        })
      ))
    );
  }
}
