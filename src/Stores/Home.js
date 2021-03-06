import { Client } from '../Client.js';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  initLanguageCodeObject,
  defaultLanguage
} from '../Utilities/LanguageCodes';
import { spinnerService } from '@simply007org/react-spinners';

let unsubscribe = new Subject();
let changeListeners = [];
const resetStore = () => ({
  metaData: initLanguageCodeObject()
});
let { metaData } = resetStore();

let notifyChange = () => {
  changeListeners.forEach(listener => {
    listener();
  });
};

let fetchMetaData = language => {
  let query = Client.items()
    .type('home')
    .elementsParameter([
      'metadata__meta_title',
      'metadata__meta_description',
      'metadata__og_title',
      'metadata__og_description',
      'metadata__og_image',
      'metadata__twitter_title',
      'metadata__twitter_site',
      'metadata__twitter_creator',
      'metadata__twitter_description',
      'metadata__twitter_image'
    ]);

  if (language) {
    query.languageParameter(language);
  }

  query
    .toObservable()
    .pipe(takeUntil(unsubscribe))
    .subscribe(response => {
      if (language) {
        metaData[language] = response.items[0];
      } else {
        metaData[defaultLanguage] = response.items[0];
      }
      notifyChange();
    });
};

class Home {
  // Actions

  provideMetaData(language, urlSlug) {
    if (spinnerService.isShowing('apiSpinner') === false) {
      spinnerService.show('apiSpinner');
    }
    fetchMetaData(language, urlSlug);
  }

  // Methods

  getMetaData(language) {
    spinnerService.hide('apiSpinner');
    return metaData[language];
  }

  // Listeners

  addChangeListener(listener) {
    changeListeners.push(listener);
  }

  removeChangeListener(listener) {
    changeListeners = changeListeners.filter(element => {
      return element !== listener;
    });
  }

  unsubscribe() {
    unsubscribe.next();
    unsubscribe.complete();
    unsubscribe = new Subject();
  }
}

let HomeStore = new Home();

export { HomeStore, resetStore };
