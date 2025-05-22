import re

def gen_latex_resume(data):

    # ------------------------
    # Escape LaTeX special characters
    def escape_latex(text):
        replacements = {
            '%': '\\%',
            '&': '\\&',
            '_': '\\_',
            '#': '\\#',
            '$': '\\$',
            '{': '\\{',
            '}': '\\}',
            '~': '\\textasciitilde{}',
            '^': '\\textasciicircum{}',
            '<': '\\textless{}',
            '>': '\\textgreater{}',
            '²': '\\textsuperscript{2}'
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        return text

    # ------------------------
    # Formatting sections
    def format_skills(skills_dict):
        return (
            "\\section{SKILLS}\n" +
            "\n".join([
                f"\\textbf{{{k}}}: {', '.join(map(escape_latex, v))} \\\\" for k, v in skills_dict.items()
            ]) + "\n"
        )

    def format_experience(work_history):
        out = "\\section{EXPERIENCE}\n\\resumeSubHeadingListStart\n"
        for job in work_history:
            out += f"\\resumeSubheading{{{escape_latex(job['company_name'])} $|$ {escape_latex(job['job_title'])}}}{{{escape_latex(job['start_date'])} -- {escape_latex(job['end_date'])}}}{{}}{{{escape_latex(job['location'])}}}\n"
            out += "\\resumeItemListStart\n"
            for item in job['responsibilities']:
                out += f"\\resumeItem{{{escape_latex(item)}}}\n"
            out += "\\resumeItemListEnd\n"
        out += "\\resumeSubHeadingListEnd\n"
        return out

    def format_projects(projects):
        out = "\\section{PROJECTS}\n\\resumeSubHeadingListStart\n"
        for p in projects:
            out += f"\\resumeProjectHeading{{\\textbf{{{escape_latex(p['project_title'])}}}}}{{}}\n"
            out += "\\resumeItemListStart\n"
            for point in p['points']:
                out += f"\\resumeItem{{{escape_latex(point)}}}\n"
            out += "\\resumeItemListEnd\n"
        out += "\\resumeSubHeadingListEnd\n"
        return out

    # ------------------------
    # Create full LaTeX string
    def generate_resume_tex(data):
        header = r"""
    \documentclass[letterpaper,10pt]{article}
    \usepackage[empty]{fullpage}
    \usepackage{titlesec}
    \usepackage{hyperref}
    \usepackage{enumitem}
    \usepackage{fancyhdr}
    \usepackage{tabularx}
    \usepackage{fontawesome5}
    \usepackage[usenames,dvipsnames]{color}
    
    \pagestyle{fancy}
    \fancyhf{}
    \renewcommand{\headrulewidth}{0pt}
    \renewcommand{\footrulewidth}{0pt}
    
    \addtolength{\oddsidemargin}{-0.5in}
    \addtolength{\textwidth}{1in}
    \addtolength{\topmargin}{-.5in}
    \addtolength{\textheight}{1.4in}
    
    \urlstyle{same}
    
    \titleformat{\section}{
      \vspace{-4pt}\scshape\raggedright\large\bfseries
    }{}{0em}{}[\titlerule \vspace{-5pt}]
    
    \newcommand{\resumeItem}[1]{\item\small{#1 \vspace{-2pt}}}
    \newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.0in, label={}]\vspace{-5pt}}
    \newcommand{\resumeSubHeadingListEnd}{\end{itemize}\vspace{-5pt}}
    \newcommand{\resumeItemListStart}{\begin{itemize}[leftmargin=*]}
    \newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}
    \newcommand{\resumeSubheading}[4]{
      \item
      \begin{tabular*}{1.0\textwidth}[t]{l@{\extracolsep{\fill}}r}
        \textbf{#1} & \textbf{\small #2} \\
        \textit{\small#3} & \textit{\small #4} \\
      \end{tabular*}\vspace{-5pt}
    }
    \newcommand{\resumeProjectHeading}[2]{
      \item
      \begin{tabular*}{1.0\textwidth}{l@{\extracolsep{\fill}}r}
        \textbf{#1} & \textit{#2} \\
      \end{tabular*}
    }
    
    \begin{document}
    """
        contact_block = f"""
    %-----------HEADER-----------
    \\begin{{center}}
        {{\\Huge \\scshape {escape_latex(data['name'])}}} \\\\ \\vspace{{1pt}}
        \\href{{mailto:{escape_latex(data['email'])}}}{{\\faEnvelope\\ \\underline{{{escape_latex(data['email'])}}}}} \\\\
    \\end{{center}}
    """
        content = (
            contact_block +
            format_skills(data['skills']) +
            format_experience(data['work_history']) +
            format_projects(data['projects']) +
            "\n\\end{document}"
        )

        return header + content

    # ------------------------
    # Write to file
    output = generate_resume_tex(data)
    with open("filled_resume.tex", "w", encoding="utf-8") as f:
        f.write(output)

    print("✅ LaTeX resume generated as 'filled_resume.tex'. Ready to paste in Overleaf.")
    return output