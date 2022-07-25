const sampleText: string = `# 📝 Welcome to coNote! 
**WARNING:** This is a very early prototype of the editor, 
there are many kinks to work out. It should be noted that any edits 
to this file is currently not saved. **DO NOT WRITE ANYTHING 
IMPORTANT HERE!**

**Note:** This app currently looks best at desktop resolution and
keyboard shortcuts currently do not work.

coNote is designed to be a simple collaborative tool 
to allow your group to start writing and collaborate 
together easily. 

Using Markdown, you can quickly write formatted text
that looks simple and clean. It's also [**easy** to pick 
up](https://www.markdowntutorial.com/)!

## 👀 Simple Demo 

You can _easily_ format your **text** like **_this_**!

You can also add subheadings of different levels!

### Subheading 

#### Another _one_.

You can also write quotes:

> "Making 🍳 the mother 👩 of all omelettes 🥘 here Jack 🤺!
   Can't fret over every egg 🥚" 
   ~ Steven Armstrong

Also writing lists:
- Milk
- Eggs
- Salmon
- Butter

## 🧩 Extensions

As of current, we have decided to use GitHub-Flavoured 
Markdown as our preferred variant, we will have more
options available down the line.

We have also added math support, rendered with KaTeX:

The following is an excerpt from a paper of MA2001:

> Let $\\boldsymbol{A}$ be a square matrix of order $n$. 
> For $\\lambda \\in \\mathbb{R}$, define:
>  - $T_\\lambda : \\mathbb{R}^n \\rightarrow \\mathbb{R}^n$ 
>     by $T_\\lambda(\\boldsymbol{u}) = \\boldsymbol{Au} - 
>      \\lambda\\boldsymbol{u}$
>
> Suppose that $\\boldsymbol{A}$ has eigenvalues 
> $\\lambda_1, \\dots, \\lambda_k$
> 
> If $\\boldsymbol{v}$ is an eigenvector of 
> $\\boldsymbol{A}$, show that:
> $$ 
> (\\boldsymbol{A}-\\lambda_1{\\boldsymbol{I}})\\cdots
> (\\boldsymbol{A}-\\lambda_k{\\boldsymbol{I}})\\boldsymbol{v}
> = \\boldsymbol{0}
> $$

## ⌚ Future Plans

We're planning to add:
- Code highlighting when writing code blocks, i.e.
  \`\`\`cpp
  cout << "Hello, world! << endl;
  \`\`\`
  Should be highlighted with proper C++ syntaxing.
- Custom styling (/w imported CSS?), or at least, more styles. Currently using GitHub's styling.
- Text wrapping on editor.
- Optimizing interface for smaller viewports.
- Get keyboard shortcuts working.
- Many more to come :D
`;

export default sampleText;
