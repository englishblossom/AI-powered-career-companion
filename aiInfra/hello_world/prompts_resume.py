prompt_resume = """
    





2. The candidate may have provided a self description and private notes. Analyze them and use this information to form an opinion about the person and shape the resume around their psychological profile — this is crucial guiding information to better know the candidate and tailor the resume to their own identity. For example — if the candidate mentions they are neurodivergent, this should be explained in terms of its perks rather than assigning the neurodivergence to the candidate, as it is not professional:

<self_description>
{SELF_DESCRIPTION}
</self_description>

<private_notes>
{PRIVATE_NOTES}
</private_notes>

3. Using the clues about the candidate so far, analyze their work history and the list of interests, then use this information to fill the professional experience section.

<interests>
{INTERESTS}
</interests>

<work_history>
{WORK_HISTORY}
</work_history>

4. Analyze the next information and use it to fill-in the contact details:

<contact_details>
{CONTACT_DETAILS}
</contact_details>

Use the following Markdown template to write a draft resume. Within the template, the elements in square brackets contain descriptions of what should be filled within that place. Fill them with the details that fulfil the guidelines while taking into account the information analyzed in the steps before.

<template>
# [name of the candidate]

[email hyperlink] | [link1 hyperlink] | [link2 hyperlink] | ...

[headline, maximum 200 characters; use guidelines, private notes, self description and the work experience to form a perfect headline that is tailored to the candidate]

## Executive Summary

[a list of 5-8 points about meaningful professional experience, tools and achievements; tailor this information to the candidate]

## Professional Experience

### [role] | [company] [location] | [dates]

[a list of 3-5 bullet points about the experience, tailoring it to the role, company and the candidate]

...
</template>

Before responding:

<response_rules>
1. Analyze the draft resume and check if it respects the guidelines, does not omit important information and it follows the template.
2. The content must be professional, unless the candidate opts-in into industries that are risky, controversial or taboo.
3. Check how it sounds and compare it to the private notes and the self description. Make adjustments to the draft, while maintaining the writing style appropriate for the candidate's personality.
4. Make sure to include all the relevant information, not just the one related to the job description.
</response_rules>

Once done, the draft resume is ready and it becomes the final resume.

Remember, this resume is important for the candidate, as it will be used to land a job. Make it unique to the candidate's personality.

Now, please proceed with redacting the resume, and only the resume. Other words are useless.
"""