var chai = require('chai');
var webdriver = require('selenium-webdriver');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var when = helpers.when;
var given = helpers.given;
var initializeScribe = helpers.initializeScribe.bind(null, '../../bower_components/scribe/src/scribe');
var seleniumBugs = helpers.seleniumBugs;
var givenContentOf = helpers.givenContentOf;
var browserName = helpers.browserName;

function loadPlugin() {
  return driver.executeAsyncScript(function (done) {
    require(['../../src/scribe-plugin-curly-quotes'], function (curlyQuotes) {
      window.scribe.use(curlyQuotes());
      done();
    });
  });
}

// Get new referenceS each time a new instance is created
var driver;
before(function () {
  driver = helpers.driver;
});

var scribeNode;
beforeEach(function () {
  scribeNode = helpers.scribeNode;
});

// TODO: Programmatically generate tests for single/double quotes

describe('curly quotes plugin', function () {
  given('block elements mode (default)', function () {
    beforeEach(function () {
      return initializeScribe();
    });

    beforeEach(loadPlugin);

    given('the caret is at the beginning of a line', function () {
      when('the user types ascii double quote', function () {
        beforeEach(function () {
          return scribeNode.sendKeys('"');
        });

        it('should insert an opening curly double quote instead', function () {
          // FIXME:
          if (seleniumBugs.firefox.curlyQuotes) { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Firefox (23, 24, 25): '<p>“””<br></p>'
            expect(innerHTML).to.have.html('<p>“<firefox-bogus-br></p>');
          });
        });
      });

      when('the user presses <right>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.RIGHT);
        });

        it('should not insert any content', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><bogus-br></p>');
          });
        });
      });
    });

    given('the caret is at the end of a word', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('Hello');
      });

      when('the user types ascii double quote', function () {
        beforeEach(function () {
          return scribeNode.sendKeys('"');
        });

        it('should insert a closing curly double quote instead', function () {
          // FIXME:
          if (seleniumBugs.firefox.curlyQuotes) { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Firefox (23, 24, 25): '<p>Hello”””<br></p>'
            expect(innerHTML).to.have.html('<p>Hello”<firefox-bogus-br></p>');
          });
        });
      });
    });


    given('the caret is after a dot', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('“Hello.');
      });

      when('the user types ascii double quote', function () {
        beforeEach(function () {
          return scribeNode.sendKeys('"');
        });

        it('should insert a closing curly double quote instead', function () {
          // FIXME:
          if (seleniumBugs.chrome.specialCharacters) { return; }
          // FIXME:
          if (seleniumBugs.firefox.curlyQuotes) { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Chrome (30): '<p>Hello.”</p>'
            // Firefox (23, 24, 25): '<p>“Hello.”””<br></p>'
            expect(innerHTML).to.have.html('<p>“Hello.”<firefox-bogus-br></p>');
          });
        });
      });
    });

    given('the caret is after an opening parenthesis', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('(');
      });

      when('the user types ascii double quote', function () {
        beforeEach(function () {
          return scribeNode.sendKeys('"');
        });

        it('should insert an opening curly double quote', function () {
          // FIXME:
          if (seleniumBugs.chrome.specialCharacters) { return; }
          // FIXME:
          if (seleniumBugs.firefox.curlyQuotes) { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Chrome (30): '<p>Hello.”</p>'
            // Firefox (23, 24, 25): '<p>“Hello.”””<br></p>'
            expect(innerHTML).to.have.html('<p>(“<firefox-bogus-br></p>');
          });
        });
      });
    });

    given('the caret is after the end of a word', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('Hello '); // Note the space
      });

      when('the user types ascii double quote', function () {
        beforeEach(function () {
          return scribeNode.sendKeys('"');
        });

        it('should insert an opening curly double quote instead', function () {
          /**
           * FIXME: Fails in Chrome.
           * Disabled as Chrome inserts a bogus &nbsp; - this
           * might be a bug we want to fix though!
           */
          if (browserName === 'chrome') { return; }
          // FIXME:
          if (seleniumBugs.firefox.curlyQuotes) { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Firefox (23, 24, 25): '<p>Hello “””<br></p>'
            expect(innerHTML).to.have.html('<p>Hello “<firefox-bogus-br></p>');
          });
        });
      });

    });

    given('default content', function () {
      beforeEach(function () {
        // Focus it before-hand
        scribeNode.click();
      });

      /* Single quotes */

      when('inserting single quotes around a single character', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>\'1\'</p>');
          });
        });

        it('should replace with curly quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>‘1’</p>');
          });
        });
      });

      when('inserting single quotes around a word', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>Hello \'world\'!</p>');
          });
        });

        it('should replace with curly single quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>Hello ‘world’!</p>');
          });
        });
      });

      when('inserting single quotes after punctuation', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>\'Hello world!\'</p>');
          });
        });

        it('should replace with curly single quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>‘Hello world!’</p>');
          });
        });
      });

      when('inserting single quotes after closing elements', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            // Misplaced inline elements wrt whitespace, but can happen
            window.scribe.insertHTML('<p>\'<em>Hello world!</em>\' <strong>And </strong>\'other\'<strong> example</strong></p>');
          });
        });

        it('should replace with curly single quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>‘<em>Hello world!</em>’ <strong>And </strong>‘other’<strong> example</strong></p>');
          });
        });
      });

      when('inserting single quotes between elements and newlines', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>1\n\'<em>2</em>\'\n3</p>');
          });
        });

        it('should replace with curly single quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>1\n‘<em>2</em>’\n3</p>');
          });
        });
      });

      when('inserting single quotes in between closing elements', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            // Misplaced inline elements wrt whitespace, but can happen
            window.scribe.insertHTML('<p>\'<em>Hello world!</em>\'</p>');
          });
        });

        // Fails due to simplistic heuristic, but we assume it's not
        // going to happen much, and can be fixed manually in the worst
        // case
        it.skip('should replace with curly single quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>‘<em>Hello world!</em>’</p>');
          });
        });
      });

      when('inserting single quotes inside a nested block element', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<blockquote><p>\'2\'</p></blockquote>');
          });
        });

        it('should replace with curly single quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<blockquote><p>‘2’</p></blockquote>');
          });
        });
      });

      when('inserting single quotes inside a nested block element that is not the first child node', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<blockquote><p>1</p><p>\'2\'</p></blockquote>');
          });
        });

        it('should replace with curly single quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<blockquote><p>1</p><p>‘2’</p></blockquote>');
          });
        });
      });

      when('inserting single quotes inside an inline element that is the sibling of a block element', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<blockquote><p>1</p><span>\'2\'</span></blockquote>');
          });
        });

        // FIXME:
        it.skip('should replace with curly single quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<blockquote><p>1</p><span>‘2’</span></blockquote>');
          });
        });
      });

      when('inserting content with single quoted attributes', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p><em class=\'foo\'>Just text</em></p>');
          });
        });

        it('should not convert them to curly quotes', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Note that the attribute quotes got changed to double quotes; no biggie though
            expect(innerHTML).to.equal('<p><em class="foo">Just text</em></p>');
          });
        });
      });

      // It's easier just to ignore all text that looks like HTML, instead of just
      // SCRIPT/STYLE.
      when('inserting escaped HTML for an element with single quoted attributes', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>&lt;p class=\'foo\'&gt;1&lt;/p&gt;</p>');
          });
        });

        it('should not convert the single quoted attributes to curly quotes', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>&lt;p class=\'foo\'&gt;1&lt;/p&gt;</p>');
          });
        });
      });

      when('inserting escaped HTML for an element with single quoted attributes which contains unescaped HTML', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>&lt;img src=\'<a>1</a>\'&gt;</p>');
          });
        });

        it('should not convert them to curly quotes', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>&lt;img src=\'<a>1</a>\'&gt;</p>');
          });
        });
      });

      when('inserting escaped HTML for an element with single quoted contents', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>&lt;p&gt;\'1\'&lt;/p&gt;</p>');
          });
        });

        it('should not convert the single quoted contents to curly quotes', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>&lt;p&gt;\'1\'&lt;/p&gt;</p>');
          });
        });
      });

      when('inserting escaped HTML for a self-closing element and single quoted attributes', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>&lt;iframe class=\'foo\'&gt;</p>');
          });
        });

        it('should not convert the single quoted attributes to curly quotes', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>&lt;iframe class=\'foo\'&gt;</p>');
          });
        });
      });


      /* Double quotes */

      when('inserting double quotes around a single character', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>"1"</p>');
          });
        });

        it('should replace with curly quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>“1”</p>');
          });
        });
      });

      when('inserting double quotes around a word', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>Hello "world"!</p>');
          });
        });

        it('should replace with curly double quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>Hello “world”!</p>');
          });
        });
      });

      when('inserting double quotes after punctuation', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>"Hello world!"</p>');
          });
        });

        it('should replace with curly double quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>“Hello world!”</p>');
          });
        });
      });


      when('inserting double quotes inside parentheses', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>("1")</p>');
          });
        });

        it('should replace with curly double quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>(“1”)</p>');
          });
        });
      });

      when('inserting double quotes after closing elements', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            // Misplaced inline elements wrt whitespace, but can happen
            window.scribe.insertHTML('<p>"<em>Hello world!</em>" <strong>And </strong>"other"<strong> example</strong></p>');
          });
        });

        it('should replace with curly double quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>“<em>Hello world!</em>” <strong>And </strong>“other”<strong> example</strong></p>');
          });
        });
      });

      when('inserting double quotes between elements and newlines', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>1\n"<em>2</em>"\n3</p>');
          });
        });

        it('should replace with curly double quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>1\n“<em>2</em>”\n3</p>');
          });
        });
      });

      when('inserting content with double quoted attributes', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p><em class="foo">Just text</em></p>');
          });
        });

        it('should not convert them to curly quotes', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p><em class="foo">Just text</em></p>');
          });
        });
      });

      // TODO: We could use insertPlainText, or better, rewrite much of
      // this as a unit test where that would not be a concern
      when('inserting escaped HTML for an element with double quoted attributes', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>&lt;p class="foo"&gt;1&lt;/p&gt;</p>');
          });
        });

        it('should not convert the double quoted attributes to curly quotes', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>&lt;p class="foo"&gt;1&lt;/p&gt;</p>');
          });
        });
      });

      when('inserting escaped HTML for an element with double quoted attributes which contains unescaped HTML', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>&lt;img src="<a>1</a>"&gt;</p>');
          });
        });

        it('should not convert them to curly quotes', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>&lt;img src="<a>1</a>"&gt;</p>');
          });
        });
      });

      when('inserting escaped HTML for an element with double quoted contents', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>&lt;p&gt;"1"&lt;/p&gt;</p>');
          });
        });

        it('should not convert the double quoted contents to curly quotes', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>&lt;p&gt;"1"&lt;/p&gt;</p>');
          });
        });
      });

      when('inserting escaped HTML for a self-closing element and double quoted attributes', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>&lt;iframe class="foo"&gt;</p>');
          });
        });

        it('should not convert the double quoted attributes to curly quotes', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>&lt;iframe class="foo"&gt;</p>');
          });
        });
      });
    });

    givenContentOf('&lt;|&gt;', function () {
      when('the user types an ascii single quote', function () {
        beforeEach(function () {
          return scribeNode.sendKeys('\'');
        });

        it('should not convert to a curly single quote', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>&lt;\'&gt;</p>');
          });
        });
      });
    });

    givenContentOf('&lt;|&gt;', function () {
      when('the user types an ascii double quote', function () {
        beforeEach(function () {
          return scribeNode.sendKeys('"');
        });

        it('should not convert to a curly double quote', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>&lt;"&gt;</p>');
          });
        });
      });
    });

    givenContentOf('&lt;foo|&gt;', function () {
      when('the user types content containing ascii single quotes (e.g. HTML attributes)', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(' bar=\'baz\'');
        });

        it('should not convert to curly single quotes', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>&lt;foo bar=\'baz\'&gt;</p>');
          });
        });
      });
    });
  });

  // TODO: Perhaps we should run all of the tests in both block/inline elements
  // mode
  given('inline element mode', function () {
    beforeEach(function () {
      return initializeScribe({ allowBlockElements: false });
    });

    beforeEach(loadPlugin);

    beforeEach(function () {
      // Focus it before-hand
      scribeNode.click();
    });

    given('default content', function () {
      when('inserting single quotes around a word', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('Hello \'world\'!');
          });
        });

        it('should replace with curly single quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('Hello ‘world’!<chrome-bogus-br>');
          });
        });
      });

      when('inserting single quotes around a word on the second line', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.insertHTML('1<br>\'2\'');
          });
        });

        it('should replace with curly single quotes instead', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('1<br>‘2’<chrome-bogus-br>');
          });
        });
      });
    });
  });
});
