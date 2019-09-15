{
    class Token {
        constructor(text) {
            this.hasUpSlash = this.hasDownSlash = this.hasCross = this.isSpecial = false;
            
            if((/a$/).test(text))
                this.value = text;
            else if((/[ei]$/).test(text)) {
                if(text.length == 1) 
                    this.value = 'e';
                else {
                    this.value = text.replace(/[ie]$/, 'a');
                    this.hasUpSlash = true;
                }
            } else if((/[ou]$/).test(text)) {
                if(text.length == 1) 
                    this.value = 'o';
                else {
                    this.value = text.replace(/[ou]$/, 'a');
                    this.hasDownSlash = true;
                }
            } else if((/[a-z]/).test(text)) {
                this.value = text + 'a';
                this.hasCross = true;
            } else {
                this.value = text;
                this.isSpecial = true;
            }
        }
    }

    class Tokenizer {
        
        constructor(string) {
            this.input = string.toLowerCase().replace(/[rcfjqvxz]/g, (m) => {
                switch(m) {
                case 'r':
                    return 'd';
                case 'c':
                    return 'k';
                case 'f':
                    return 'p';
                case 'j':
                    return 'dy';
                case 'q':
                    return 'kw';
                case 'v':
                    return 'v';
                case 'x':
                    return 's';
                case 'z':
                    return 's';
                }
            });
            this.token = null;
            this.index = -1;
            this._pushBack = false;
        }

        hasNext() {
            return this._pushBack || this.input[1+this.index] != undefined;
        }

        pushBack() {
            this._pushBack = true;
        }

        advance() {

            if(this._pushBack) 
                this._pushBack = false;
            else {

                let curChar = this.input[++this.index];

                if(curChar == undefined) {
                    this.token = null;
                    throw 'There are no more tokens.';
                } 
                    
                let text = curChar;

                curChar = this.input[this.index+1];
                if(curChar != undefined && (/(?![aeiou])[a-z]/).test(text)) {
                        
                    if(text == 'n' && curChar == 'g') {
                        this.index++;
                        text += curChar;
                    }
                    
                    curChar = this.input[this.index+1];       
                    if(curChar != undefined && (/[aeiou]/).test(curChar)) {
                        this.index++;
                        text += curChar;
                    }
                    
                } 
                
                this.token = new Token(text);
                
            } 

        }

        reset() {
            this.token = null;
            this.index = -1;
        }

    }

    class Parser {
        constructor(tokenizer) {
            this.tokenizer = tokenizer;  
            this.statement = null;
        }

        advance() {
            
            this.tokenizer.advance();
            this.statement = [this.tokenizer.token];
            
            if(this.tokenizer.hasNext() && (!this.statement[0].isSpecial || this.statement[0].value == '-')) {
                
                this.tokenizer.advance();

                let isWordChar = true;

                while(isWordChar = !this.tokenizer.token.isSpecial || this.tokenizer.token.value == '-') {
                    this.statement.push(this.tokenizer.token);
                    
                    if(this.tokenizer.hasNext()) 
                        this.tokenizer.advance();
                    else 
                        break;
                
                }

                if(!isWordChar) 
                    this.tokenizer.pushBack();
            }

        }

        hasNext() {
            return this.tokenizer.hasNext();
        }
    }

    class Translator {
        
        constructor(parser) {
            this.parser = parser;
            this.translation = null;
        }

        advance() {
          
            this.parser.advance();

            if(this.parser.statement[0].value == '\n')
                this.translation = '<br>';
            else {

                this.translation = '<span class="statement">';

                for(let token of this.parser.statement) {
                    this.translation += '<span>';

                    if(token.isSpecial)    
                        this.translation += `<span>${token.value}</span>`;
                    else {
                        if(token.hasUpSlash)
                            this.translation += '<img src="images/slash.png">';
                        else
                            this.translation += '<div></div>';

                        this.translation += `<img src="images/${token.value}.png">`;
                        
                        if(token.hasDownSlash)
                            this.translation += '<img src="images/slash.png">';
                        else if(token.hasCross)
                            this.translation += '<img src="images/cross.png">';
                        else
                            this.translation += '<div></div>';
                    }

                    this.translation += '</span>';
                }

                this.translation += '</span>';
            }
        }

        hasNext() {
            return this.parser.hasNext();
        }

    }

    const menu_button = document.querySelector('#menu_button'),
          settings = document.querySelector('.settings'),
          input = document.querySelector('.input'),
          output = document.querySelector('.output'),
          inner_output = output.firstElementChild,
          text_align = document.querySelector('select'),
          word_wrap = document.querySelector('input[type="checkbox"]'),
          input_font_size = document.querySelector('#input_font_size');

    input.addEventListener('input', () => {
        let translator = new Translator(new Parser(new Tokenizer(input.value)));
        let string = '';

        while(translator.hasNext()) {
            translator.advance();
            string += translator.translation;
        }

        inner_output.innerHTML = string;
    });
    
    menu_button.addEventListener('click', () => {
        menu_button.classList.toggle('change');
        settings.classList.toggle('show');
    });

    text_align.addEventListener('change', () => {
        input.classList.remove('left', 'center', 'right');
        input.classList.add(text_align.options[text_align.selectedIndex].text);
        output.classList.remove('left', 'center', 'right');
        output.classList.add(text_align.options[text_align.selectedIndex].text);
    });

    word_wrap.addEventListener('change', () => {
        input.classList.toggle('no_wrap');
        output.classList.toggle('no_wrap');
    });

    input_font_size.addEventListener('change', () => {
        let style = document.createAttribute('style');
        style.value = `font-size: ${input_font_size.value}px;`;
        input.attributes.setNamedItem(style);
    });

    output_font_size.addEventListener('change', () => {
        let style = document.createAttribute('style');
        style.value = `zoom: ${output_font_size.value};`;
        inner_output.attributes.setNamedItem(style);
    });

    document.querySelector('button').addEventListener('click', () => window.print());

}