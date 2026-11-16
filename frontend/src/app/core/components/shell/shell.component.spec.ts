import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideTestingDeps } from '../../../../testing/providers';
import { ShellComponent } from './shell.component';

@Component({
  template: `
    <app-shell>
      <ng-container shellNav><a class="lien">Lien du menu</a></ng-container>
      <p class="contenu">Contenu de la page</p>
    </app-shell>
  `,
  imports: [ShellComponent]
})
class HostComponent { }

@Component({ template: '' })
class BlankComponent { }

describe('ShellComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let element: HTMLElement;

  const nav = () => element.querySelector('.shell__nav') as HTMLElement;
  const burger = () => element.querySelector('.shell__burger') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: provideTestingDeps([{ path: 'ailleurs', component: BlankComponent }])
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('place le menu et la page dans leurs emplacements', () => {
    expect(nav().querySelector('.lien')?.textContent).toBe('Lien du menu');
    expect(element.querySelector('.shell__main .contenu')?.textContent).toBe('Contenu de la page');
  });

  it('ouvre et referme le menu avec le bouton de la barre', () => {
    expect(nav().classList).not.toContain('open');
    expect(burger().getAttribute('aria-expanded')).toBe('false');

    burger().click();
    fixture.detectChanges();
    expect(nav().classList).toContain('open');
    expect(burger().getAttribute('aria-expanded')).toBe('true');

    burger().click();
    fixture.detectChanges();
    expect(nav().classList).not.toContain('open');
  });

  it("referme le menu d'un appui en dehors", () => {
    burger().click();
    fixture.detectChanges();

    (element.querySelector('.shell__backdrop') as HTMLElement).click();
    fixture.detectChanges();

    expect(nav().classList).not.toContain('open');
    expect(element.querySelector('.shell__backdrop')).toBeNull();
  });

  it('referme le menu quand on change de page', async () => {
    burger().click();
    fixture.detectChanges();

    await TestBed.inject(Router).navigate(['/ailleurs']);
    fixture.detectChanges();

    expect(nav().classList).not.toContain('open');
  });
});
