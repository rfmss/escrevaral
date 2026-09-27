# Portparser.v2

Second version of Portparser, a parsing model to perform the annotation following the Universal Dependencies (UD) framework for Portuguese language. texts.

This new version of Portparser was create using the Latin Pipe software (https://github.com/ufal/evalatin2024-latinpipe) trained over the second version of the corpus Porttinari-base as training set and using BERTimbau (bert-base-portuguese-cased) as word embedings model. The model was generate with 80 iterations and after the Latin Pipe annotation the resulting file is submitted to a post processing code that fix some lemmas and morphological features (fields LEMMA and FEATS from the CoNLL-U representation). After the annotation with Latin Pipe and the post processing the final achieved indices for automatic annotation were the impressive:
- UPOS: 99.45%
- UFeats: 99.20% (99.19% before post processing)
- AllTags: 98.92%
- Lemmas: 99.36% (98.77% before post processing)
- UAS: 97.17%
- LAS: 96.19%

# Online Version

This model is available in a web service at:

[https://huggingface.co/spaces/NILC-ICMC-USP/Portparser.v2](https://huggingface.co/spaces/NILC-ICMC-USP/Portparser.v2).


# The Available Model
This model is available in the contents of the directory `Portparser_v2_model`. Since this file is too large for Git Hub - 1.53 Gb - it is available for download [here](https://drive.google.com/file/d/1fus6fz3XTUZIVXM58T-ygemCbuFzQnqf/view?usp=sharing).

To use this model with Latin Pipe you need to:
- install Latin Pipe in your machine - see the requirements and instructions at [Latin Pipe page](https://github.com/ufal/evalatin2024-latinpipe);
- download (click [here](https://drive.google.com/file/d/1fus6fz3XTUZIVXM58T-ygemCbuFzQnqf/view?usp=sharing)) and unzip the directory `Portparser_v2_model` to the same location of your Latin Pipe code file (`latinpipe_evalatin24.py`);
- run Latin Pipe over your CoNLL-U file, for instance `my_file.conllu` (Latin Pipe does not perform tokenization, your imput has to be a `.conllu` file) with the command:
    - `python3.11 latinpipe_evalatin24.py --load Portparser_v2_model/model.weights.h5 --exp annotation --test my_file.conllu`
 
This command will generate the file `my_file.predicted.conllu` with the automatic annotation performed by Latin Pipe using PortParser.v2 model.

Latin Pipe requires the absence of errors in the input `.conllu` file, so it is safer to have the input `.conllu` file with only the first two and last columns filled (token ID, FORM, and MISC) and all other columns empty (token LEMMA, UPOS, XPOS, FEATS, HEAD, DEPREL, and DEPS).

# The Post Processing
The resulting annotated `.predicted.conllu` file can optionally be post processed to fix some of the lemma and features annotation using the post processing code (`postprocess.py` in the directory `postproc`) that generates the final automatically annotated CoNLL-U file.

To perform the post processing you need to download the post processing directory into your machine, and at the folder postproc the command to be execute is, for example:
- `python3 postprocess.py -l -f -q -o my_file.annotated.conllu my_file.predicted.conllu`

This command will generate the file `my_file.annotated.conllu` with the best possible annotation according to our experiments. Some options for the post processing are available:
- If the post processing task is to be done only for lemmas, the option `-f` should be omitted;
- If the post processing task is to be done only for features, the option `-l` should be omitted;
- If a report of the changes performed by the post processing is necessary, the option `-q` should be omitted.

# Annotation of Textual files
If you do not have a CoNLL-U file of your text to be annotated, you can use the following programs to:
- perform the segmentation of your textual files (this software receives as input a textual file and returns a textual file with one sentence per line):
    - https://github.com/LuceleneL/portSentencer
- perform the tokenization of segmented sentences file (this software receives a textual file with one sentence per line and return a `.conllu` file ready to be annotated):
    - https://github.com/LuceleneL/portTokenizer

## File Structure
The files are stored in the following directories:
- `Portparser_v2_model` - the proposed model to be used with Latin Pipe (incomplete as of now, but downloadable in full [here](https://drive.google.com/file/d/1fus6fz3XTUZIVXM58T-ygemCbuFzQnqf/view?usp=sharing));
- `my_file.conllu` - an example of input (a CoNLL-U file with five sentences in Portuguese);
- `postproc` - the directory with the post processing code:
    - `postproc.py` - the main Python program to perform the post processing
    - `usAbbr.tsv` - a data file with all known abbreviation to be considered (a 4 columns table separated values (`.tsv`) file with abbreviation in the format: `form`, `UPOS`, `LEMMA`, `FEATS`;
    - `conlluFile.py` - an auxiliary Python program to handle `.conllu` files;
    - `lexikon.py` - an auxiliary Python program to access Portilexicon-UD a lexicon for Portuguese annotation in UD, this code requires the following files as data:
        - `ADJ.tsv` - list of adjectives;
        - `ADP.tsv` - list of adpositions;
        - `ADV.tsv` - list of adverbs;
        - `AUX.tsv` - list of auxiliary verbs;
        - `CCONJ.tsv` - list of coordinative conjunctions;
        - `DET.tsv` - list of determiners;
        - `INTJ.tsv` - list of interjections;
        - `NOUN.tsv` - list of nouns;
        - `NUM.tsv` - list of number in written;
        - `PRON.tsv` - list of pronouns;
        - `SCONJ.tsv` - list of subordinative conjunctions;
        - `VERB.tsv` - list of verbs (this file is very large (71 Mb) - it can be downloaded from [here](https://drive.google.com/file/d/1N2k6W42SgGX18e_YXz7W5wiSVufWL3lq/view?usp=sharing);
        - `WORDmaster.txt` - full list of forms in the lexikon.


# Acknowledgments
This work was carried out at the Center for Artificial Intelligence of the University of São Paulo (C4AI - [http://c4ai.inova.usp.br/](http://c4ai.inova.usp.br/)), with support by the São Paulo Research Foundation (FAPESP grant #2019/07665-4) and by the IBM Corporation. The project was also supported by the Ministry of Science, Technology and Innovation, with resources of Law N. 8.248, of October 23, 1991, within the scope of PPI-SOFTEX, coordinated by Softex and published as Residence in TIC 13, DOU 01245.010222/2022-44.

