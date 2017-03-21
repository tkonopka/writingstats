---
layout: about
title: Writing stats - about
permalink: /about/
---


Writing Stats is a simple app to help you understand your writing. 




<span id="textarea"></span>

## Input text

Type or paste some text into the text area on the left-hand side. 
You can also load text from a file or URL.

To load a local file, click the `Browse` button. After you select a file from 
disk, the app will display it in the text area.

To load text from a URL, enter the address into the textbox and click `Load`. 

After you have some text, click `Run` to perform the analysis. Results are 
organized into boxes on the right-hand side.

<div class="ws-example">
<span class="ws-example-header">Tip</span>
<p>Click on chart components to reveal additional information.</p>
</div>




<span id="overview"></span>

## Text summary

The first analysis box displays simple counters for the number of paragraphs, 
sentences, and words in the input text. 

<div class="ws-example">
<span class="ws-example-header">Tip</span>
<p>If you want to exclude some text from the analysis, 
add a <span class="ws-highlight">#</span> or 
<span class="ws-highlight">%</span> character at the start of a paragraph.</p>
<p>To focus on a section, use markers
<span class="ws-highlight">%start%</span> and 
<span class="ws-highlight">%end%</span> at the start of a paragraph to demarcate 
analysis boundaries.</p>
</div>




<span id="structure"></span>

## Text structure

The structure box shows a bar plot with the number of words in each sentence.

Long sentences can be hard to understand. Tall spikes in the plot may thus
indicate areas for revision.

Bars in the plot are color-coded by paragraph. Long stretches of same-color 
bars may be signs to split complex paragraphs into smaller parts. 




<span id="words"></span>

## Frequent words

The frequent words analysis displays the most commonly used words. High-frequency 
words can bring out the topic/focus of your writing. But they may also indicate 
poor vocabulary. 

The first plot shows frequencies of words anywhere in a sentence. Small words
like 'the' or 'in' are omitted; remaining words are ordered by decreasing 
frequency. 

The second plot focuses on the leading words within sentences. This plot 
includes small words like "The" or "In".

<div class="ws-example">
<span class="ws-example-header">Example</span>

<p class="ws-quote"><span class="ws-highlight">"The</span> frequent words analysis ..."</p>

<p class="ws-quote"><span class="ws-highlight">"The</span> first plot shows frequencies ..."</p>

<p class="ws-quote"><span class="ws-highlight">"The</span> second plot focuses on ..."</p>

<p>These examples highlight repeated sentence structure.</p>
</div>




<span id="kmers"></span>

## Enriched k-mers

k-mers are sequences of characters. They may capture entire words or only portions
thereof. For example, the sequence 'errifi' is a 6-mer (it contains six characters)
of the word 'terrific'. 

Enriched k-mers are sequences that are over-represented in a sentence or 
paragraph. Enrichment can be an intentional technique to create emphasis. 
However, repeated k-mers may also indicate repetitive style.

In the first plot, unusual k-mers are identified per *sentence*. Numeric scores 
represent the relative k-mer frequency in a sentence compared to the whole text. 

<div class="ws-example">
<span class="ws-example-header">Example</span>
<p class="ws-quote">"If the <span class="ws-highlight">difference</span> between 
two numbers is not zero, then they are <span class="ws-highlight">different</span>."</p>
<p>All the words in this sentence are distinct, but the k-mer 'differ' is repeated twice.</p>
</div>

The second plot shows unusual k-mers in *paragraphs*. Technically, the 
statistic is the
[chi-square](https://en.wikipedia.org/wiki/Chi-squared_distribution). 




<span id="patterns"></span>

## Patterns

Here you can explore text patterns of interest to you. Just write a 
word or k-mer to display all the sentences matching that pattern.

<div class="ws-example">
<span class="ws-example-header">Tip</span>
<p>You can search for patterns using
<a href="https://en.wikipedia.org/wiki/Regular_expression">regular expressions</a>.</p>

<p>For example, to search for words that start with 'no', enter
the expression <span class="ws-highlight">^no</span></p> 

<p>As another example, to search for words that 
end with 'ly', enter <span class="ws-highlight">ly$</span></p>
</div>




<br/>
<span id="thanks"></span>

## Acknowledgments

Writing Stats provides some unique writing aids, but it draws inspiration 
from existing tools. 

[Hemingway app](http://www.hemingwayapp.com/) scores 
text for readability. It also helps identify problem words and phrases.

[Grammarly](https://www.grammarly.com/) performs spelling and grammar checks.
 
