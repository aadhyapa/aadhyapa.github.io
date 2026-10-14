---
title: 'Who am I as an Engineer?'
date: 2026-10-13
category: 'tech-diary'
summary: 'Engineer in an Agentic World'
draft: false
---
For three months, I've been chasing one question: who am I as an engineer in a world where AI writes code? My classes teach me how to write code, but people no longer seem to care about it.

So I went looking for answers. I talked to engineers across tech, from students to a senior engineer at Microsoft. I found a mentor. And I kept changing how I work, across my projects, my research, and my SWE job at MSU.

I don't have it all figured out. But four ideas kept coming up.

## 1. Be an end-user

At Hudl, I worked on software used by coaches. And these coaches were incredibly talented. They were experts at what they do, and they had no patience for software that got in their way.

That changed how I saw usability. When someone that sharp can't figure out how to use your product, it isn't their fault. It's yours.

I think this is where engineers struggle most. We're often far removed from the people actually using our work. We see tickets and specs, not the coach trying to find a clip five minutes before practice.

AI makes this gap more dangerous. When code is cheap to write, it's easy to build a lot of the wrong thing quickly. AI can build almost any feature you describe. It can't tell you whether a real person will understand it.

So a good engineer builds with end-users in mind. For me, that means talking to the end-users as much as possible and asking myself two questions at every step of development:
1. How will this help the client?
2. How will this frustrate the client?

## 2. Be an architect

For my Amazon capstone, we needed to deploy our website. When we asked AI, it suggested running it on an EC2 instance. That's a common answer, and it would have worked.

Instead, we hosted the site on S3 and served it through CloudFront. Our site didn't need a server running around the clock. With S3 and CloudFront, we paid for storage and traffic instead of an always-on machine. That choice kept us within budget.

The lesson wasn't that AI was wrong. It gave us the most common answer, not the best answer for our constraints. It didn't know our budget, our traffic, or what our project actually needed. We did.

AI is great at writing code and planning small tasks. Deciding how a system fits together, and what it should cost to run, is still on us. Thinking like an architect means asking what your system actually needs before accepting the default.

Now, before I take AI's word for it, I find three other ways to do the same thing and make the judgment myself.

## 3. Read code well

In one of my coffee chats, a senior engineer at Microsoft told me something that stuck. A lot of people are shipping sloppy AI-generated code. The best AI users he knows work more like managers: they direct the work, then review it carefully.

My mentor from Pinterest took that one step further. He told me that code comprehension matters now more than ever. If AI writes it, you'd better understand it.

It sounds less exciting than "prompt engineering" or "agents," but it makes sense. When AI writes most of the code, your job shifts from writing to reading. You're the one deciding whether the code is correct, safe, and maintainable. You can't do that if you can't follow it.

I found that getting more involved in code reviews helps build this skill. It helps me get better at spotting good and bad code and connecting all the services a piece of code affects.

## 4. Be a business person

This lesson is the most personal one.

I was let go from my job at MSU. They told me that they didn't need me anymore.

Then my mentor found a business problem, and that got me hired back. The code I could write hadn't changed. What changed was that my work was now tied to something the team needed.

That showed me how much understanding the business's pain points matters. Teams don't keep engineers just because they can write code, especially now that AI can write a lot of it. They keep people who solve problems the business cares about.

Now I think every engineer should be able to answer three questions about their work:

1. What problem does this solve?
2. Who cares that it's solved?
3. How would I explain its impact to someone who isn't an engineer?

If you can't answer those, you probably don't understand your work as well as you think.

## TLDR:

Three months ago, I asked who I am as an engineer when AI writes code. My answer so far: AI writes more and more of the code, so my job is everything around it. I need to understand the people using what I build, the system it runs on, the code itself, and the business it serves.

None of these are new skills. Good engineers have always had them. What's changed is that they used to be extras, and now they're the job.

I'm still figuring this out, and I'll keep writing about it here as I go.