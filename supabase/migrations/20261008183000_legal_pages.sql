create table public.legal_pages (
  slug text primary key check (slug in ('privacy', 'delivery', 'terms')),
  title text not null check (char_length(title) between 2 and 120),
  body text not null check (char_length(body) between 20 and 12000),
  updated_at timestamptz not null default now()
);

alter table public.legal_pages enable row level security;

create policy "Anyone can read legal pages"
on public.legal_pages for select
to anon, authenticated
using (true);

grant select on public.legal_pages to anon, authenticated;
revoke insert, update, delete on public.legal_pages from public, anon, authenticated;

insert into public.legal_pages (slug, title, body)
values
    ('privacy', 'Privacy policy', $$This policy explains what Sacred But Fully Known collects when you browse this website, create an account, buy the book, or send an enquiry, and how that information is used.

We collect the name and email address you use to create an account. When you order a hard copy, we also collect the phone number and the delivery address you enter: country, state, city or town, and nearest landmark. We store what you ordered, the amount due, the Paystack payment reference, and the status of the order. A message sent through the contact form keeps your name, email address, subject, and message so we can reply.

Paystack takes the payment. We do not collect or store your card number. Paystack tells us whether the charge succeeded, the amount, and a reference. An order is marked paid only after that confirmation.

We use this information to run your account, show your orders, deliver a hard copy to the address you gave us, make the e-copy available to download after payment, and answer enquiries. We do not sell your personal information.

Account and order records are stored with Supabase. Payment details are processed by Paystack under Paystack’s own privacy policy. We share a hard-copy delivery address with the courier only so the book can be delivered.

You can review your name and email on your profile, and you can change a hard-copy delivery address while the order is still unpaid. Changing your password requires a one-time code sent to your email. To ask for the information we hold, or to ask us to correct it, use the contact form.

We keep order and enquiry records for as long as we need them to complete an order, handle a return, and keep ordinary sales records. The site uses a session cookie so you can stay signed in. We do not use it to advertise to you on other websites.$$),
    ('delivery', 'Delivery and returns', $$A hard copy of Sacred But Fully Known is a printed book sent to the delivery address you enter when you place the order. Check the state, city or town, phone number, and nearest landmark before you pay. You can change that address from checkout, or from your profile, while the order is still unpaid. After payment, contact us if the address must change. We can change it only if the book has not already been handed to the courier.

The price you pay is the book price plus any delivery fee shown before you go to Paystack. Payment is in Nigerian naira. A hard copy is prepared for delivery only after Paystack confirms the payment. You can follow the order on the Orders page as it moves from awaiting fulfilment, to confirmed, to in transit, and then to delivered.

An e-copy is a PDF for reading on your device. There is no courier and no delivery fee. After Paystack confirms payment, sign in and download the file from your account. The download is for your personal use.

If a hard copy arrives damaged, with pages missing, or is not the book you ordered, contact us within 7 days of delivery and tell us the order and what is wrong. We will replace the book or refund what you paid for it, including the delivery fee when the problem was ours.

If you change your mind about a hard copy, contact us before the order is marked in transit. Once the printed book has been dispatched, we do not take it back for a change of mind.

An e-copy cannot be returned after the file has been downloaded, because a digital file cannot be sent back. If the file will not open, contact us and we will provide a working file or refund the payment.

Refunds go back through Paystack to the original payment method. An order that was cancelled before payment has nothing to refund.$$),
    ('terms', 'Terms of use', $$These terms apply when you browse this website, create an account, or buy Sacred But Fully Known as a hard copy or an e-copy.

The store sells the formats shown on the book page. The description and price on each format are the ones that apply to that purchase. You pay the book price plus any delivery fee shown before Paystack opens.

You need an account to place an order. Use your real name, an email address you can open, and, for a hard copy, a delivery address and phone number where the book can reach you. Keep your password private. We may refuse an order we cannot fulfil. If we cancel an order after taking payment, we refund that payment.

Paystack processes the payment. We mark an order as paid only when Paystack confirms the charge for the correct amount. Do not send card details through the contact form. We will not ask for them.

The e-copy is licensed to you for your own reading. You may not sell copies of the file, share it, or upload it for other people to download. The hard copy is a printed book. After it is delivered you may keep that copy or give it away. You may not scan it to make a replacement e-copy for other people.

The text of the book, the cover, and the words and pictures on this website belong to their owners. You may not reuse them for your own book or product.

If a book is damaged, incorrect, or a file will not open, the delivery and returns policy describes the replacement or refund. We are not responsible for a delay caused by an address or phone number we cannot use.

We may update these terms, the privacy policy, and the delivery and returns policy. The copy published on this website is the one that applies. Questions about an order can be sent through the contact form.$$)
on conflict (slug) do nothing;
