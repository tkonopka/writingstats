---
layout: about
title: Writing stats - about
permalink: /about.html
---


Writing Stats is a simple app to help you understand your writing. 

 - The app computes a series of statistics from your input. Descriptions below 
offer some hints for their interpretation.

- The app displays the statistics in visual form through bar plots. These can 
help you identify key features in your text.

- Interactions with the bar plots bring out portions of your text. Seeing these
portions in new contexts can inspire the critical eye. 



<span id="textarea"></span>

## Input text

To begin, type or paste some text into the text area on the left hand side. 
You can also load text from a file or URL.

 -  To load a local file, click the `Browse` button. After you select a file from 
disk, the app will display it in the text area.

 - To load text from a URL, enter the address into the textbox and click `Load`. 

After you have some text, click `Run` to perform the analysis. Results are 
organized into boxes on the right hand side.




<span id="overview"></span>

## Overview stats

The overview box displays simple counters: number of paragraphs, sentences, and 
words in the input text. 




<span id="structure"></span>

## Structure stats

The structure box shows a bar plot with the number of words in each sentence.
Click on the bars to extract individual sentences.

 - Long sentences can be hard to understand. If you see tall spikes in the plot,
they may indicate areas for revision.

 - Bars in the plot are color-coded by paragraph. Long stretches of same-color 
bars may be signs to split complex paragraphs into smaller parts. 




<span id="words"></span>

## Word stats

The box labeled as 'Words' contains two plots with word frequencies. 

The first plot shows frequencies of words anywhere in a sentence. Small words
like 'the' or 'in' are omitted; remaining words are ordered by decreasing 
frequency. You can click on the bars to see the highlighted words in their context.

 - High-frequency words can bring out the topic/focus of your writing. But they
may also indicate poor vocabulary. 

The second plot shows frequencies of the first words in sentences. This plot 
includes small words like "The" or "In".

 - High-frequency start words may indicate monotonous style.




<span id="kmers"></span>

## k-mer stats

k-mers are sequences of characters. They may capture entire words or only portions
thereof. For example, the sequence 'terri' is a 5-mer (it contains five characters)
of the word 'terrific'. 

The k-mer analysis box shows bar plots with unusual k-mers. In the first plot, 
the measure of 'unusual' k-mer is computed per *sentence*. Enrichment is the relative
k-mer frequency within a *sentence* compared to the whole text. 

 - Enriched k-mers in sentences can be indicators of typos or repetitive style. 

In the second plot, the measure of 'unusual' k-mers is based on *paragraphs*. 
Technically, the statistic is the chi-square. 

 - Enriched k-mers in paragraphs can bring out the topic focus.

In both plots, you can click on the k-mers to see how they appear in context. 




<span id="thanks"></span>

## Acknowledgments

The Writing Stats app provides some unique writing aids, but it draws 
inspiration from existing tools. 

 - [Hemingway app](http://www.hemingwayapp.com/) scores 
text for readability. It also helps identify problem words and phrases.

 - [Grammarly](https://www.grammarly.com/) performs spelling and grammar checks.
 
