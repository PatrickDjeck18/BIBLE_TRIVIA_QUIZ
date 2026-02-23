export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
}

export interface Level {
    id: string;
    title: string;
    description: string;
    questions: Question[];
}

import { genesisQuestions } from './questions/genesis';
import { exodusQuestions } from './questions/exodus';
import { leviticusQuestions } from './questions/leviticus';
import { numbersQuestions } from './questions/numbers';
import { deuteronomyQuestions } from './questions/deuteronomy';
import { joshuaQuestions } from './questions/joshua';
import { judgesQuestions } from './questions/judges';
import { ruthQuestions } from './questions/ruth';
import { samuel1Questions } from './questions/samuel1';
import { samuel2Questions } from './questions/samuel2';
import { kings1Questions } from './questions/kings1';
import { kings2Questions } from './questions/kings2';
import { chronicles1Questions } from './questions/chronicles1';
import { chronicles2Questions } from './questions/chronicles2';
import { ezraQuestions } from './questions/ezra';
import { nehemiahQuestions } from './questions/nehemiah';
import { estherQuestions } from './questions/esther';
import { jobQuestions } from './questions/job';
import { psalmsQuestions } from './questions/psalms';
import { proverbsQuestions } from './questions/proverbs';
import { ecclesiastesQuestions } from './questions/ecclesiastes';
import { songofsolomonQuestions } from './questions/songofsolomon';
import { isaiahQuestions } from './questions/isaiah';
import { jeremiahQuestions } from './questions/jeremiah';
import { lamentationsQuestions } from './questions/lamentations';
import { ezekielQuestions } from './questions/ezekiel';
import { danielQuestions } from './questions/daniel';
import { hoseaQuestions } from './questions/hosea';
import { joelQuestions } from './questions/joel';
import { amosQuestions } from './questions/amos';
import { obadiahQuestions } from './questions/obadiah';
import { jonahQuestions } from './questions/jonah';
import { micahQuestions } from './questions/micah';
import { nahumQuestions } from './questions/nahum';
import { habakkukQuestions } from './questions/habakkuk';
import { zephaniahQuestions } from './questions/zephaniah';
import { haggaiQuestions } from './questions/haggai';
import { zechariahQuestions } from './questions/zechariah';
import { malachiQuestions } from './questions/malachi';
import { matthewQuestions } from './questions/matthew';
import { markQuestions } from './questions/mark';
import { lukeQuestions } from './questions/luke';
import { johnQuestions } from './questions/john';
import { actsQuestions } from './questions/acts';
import { romansQuestions } from './questions/romans';
import { corinthians1Questions } from './questions/corinthians1';
import { corinthians2Questions } from './questions/corinthians2';
import { galatiansQuestions } from './questions/galatians';
import { ephesiansQuestions } from './questions/ephesians';
import { philippiansQuestions } from './questions/philippians';
import { colossiansQuestions } from './questions/colossians';
import { thessalonians1Questions } from './questions/thessalonians1';
import { thessalonians2Questions } from './questions/thessalonians2';
import { timothy1Questions } from './questions/timothy1';
import { timothy2Questions } from './questions/timothy2';
import { titusQuestions } from './questions/titus';
import { philemonQuestions } from './questions/philemon';
import { hebrewsQuestions } from './questions/hebrews';
import { jamesQuestions } from './questions/james';
import { peter1Questions } from './questions/peter1';
import { peter2Questions } from './questions/peter2';
import { john1Questions } from './questions/john1';
import { john2Questions } from './questions/john2';
import { john3Questions } from './questions/john3';
import { judeQuestions } from './questions/jude';
import { revelationQuestions } from './questions/revelation';
import { books } from './books';

export const getQuestionsForBook = (bookId: string): Question[] => {
    switch (bookId) {
        case 'gen': return genesisQuestions;
        case 'exo': return exodusQuestions;
        case 'lev': return leviticusQuestions;
        case 'num': return numbersQuestions;
        case 'deu': return deuteronomyQuestions;
        case 'jos': return joshuaQuestions;
        case 'jdg': return judgesQuestions;
        case 'rut': return ruthQuestions;
        case '1sa': return samuel1Questions;
        case '2sa': return samuel2Questions;
        case '1ki': return kings1Questions;
        case '2ki': return kings2Questions;
        case '1ch': return chronicles1Questions;
        case '2ch': return chronicles2Questions;
        case 'ezr': return ezraQuestions;
        case 'neh': return nehemiahQuestions;
        case 'est': return estherQuestions;
        case 'job': return jobQuestions;
        case 'psa': return psalmsQuestions;
        case 'pro': return proverbsQuestions;
        case 'ecc': return ecclesiastesQuestions;
        case 'sng': return songofsolomonQuestions;
        case 'isa': return isaiahQuestions;
        case 'jer': return jeremiahQuestions;
        case 'lam': return lamentationsQuestions;
        case 'ezk': return ezekielQuestions;
        case 'dan': return danielQuestions;
        case 'hos': return hoseaQuestions;
        case 'jol': return joelQuestions;
        case 'amo': return amosQuestions;
        case 'oba': return obadiahQuestions;
        case 'jon': return jonahQuestions;
        case 'mic': return micahQuestions;
        case 'nah': return nahumQuestions;
        case 'hab': return habakkukQuestions;
        case 'zep': return zephaniahQuestions;
        case 'hag': return haggaiQuestions;
        case 'zec': return zechariahQuestions;
        case 'mal': return malachiQuestions;
        case 'mat': return matthewQuestions;
        case 'mar': return markQuestions;
        case 'luk': return lukeQuestions;
        case 'jhn': return johnQuestions;
        case 'act': return actsQuestions;
        case 'rom': return romansQuestions;
        case '1co': return corinthians1Questions;
        case '2co': return corinthians2Questions;
        case 'gal': return galatiansQuestions;
        case 'eph': return ephesiansQuestions;
        case 'phi': return philippiansQuestions;
        case 'col': return colossiansQuestions;
        case '1th': return thessalonians1Questions;
        case '2th': return thessalonians2Questions;
        case '1ti': return timothy1Questions;
        case '2ti': return timothy2Questions;
        case 'tit': return titusQuestions;
        case 'phm': return philemonQuestions;
        case 'heb': return hebrewsQuestions;
        case 'jas': return jamesQuestions;
        case '1pe': return peter1Questions;
        case '2pe': return peter2Questions;
        case '1jn': return john1Questions;
        case '2jn': return john2Questions;
        case '3jn': return john3Questions;
        case 'jud': return judeQuestions;
        case 'rev': return revelationQuestions;
        default:
            // Placeholder for other books
            return [
                {
                    id: `${bookId}_1`,
                    text: `Question for ${books.find(b => b.id === bookId)?.title || bookId}...`,
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correctAnswer: 'Option A',
                }
            ];
    }
};

export const levels = books.map(book => ({
    id: book.id,
    title: book.title,
    description: book.category,
    questions: getQuestionsForBook(book.id),
    color: book.color // Add color from books definition
}));
