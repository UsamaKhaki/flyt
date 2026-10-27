# Demo recording

`flyt-demo.mp4` is a 42 second, 1280x720 H.264 walkthrough of a local production build (`pnpm build`, then `next start -p 6801`) with the mock provider. It has on-screen captions and no audio. It was recorded by driving Chromium with Playwright, capturing frames over the DevTools screencast and encoding them with AVFoundation.

## Script

| Time | On screen                                                                | Caption                                                                             |
| ---- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| 0:00 | Home page, search form prefilled with Dubai                              | Flyt: search once, compare every fare, book with the partner                        |
| 0:03 | Type "sing" in To, pick Singapore with the keyboard                      | Airport search works by city, code or country                                       |
| 0:07 | Open the date picker, choose 20 to 27 Nov                                | The date picker flips to stay on screen                                             |
| 0:11 | Open travellers, add an adult and two infants; a third infant is blocked | Traveller limits mirror airline rules: max 9, one infant per adult                  |
| 0:18 | Search, results render                                                   | Results are server rendered from the URL, so every search is shareable              |
| 0:20 | Click Cheapest, then Fastest                                             | Sort by best, cheapest or fastest                                                   |
| 0:25 | Click "Up to 1 stop", scroll the list                                    | Filter by stops and airline                                                         |
| 0:27 | Click View deal on the top offer, demo hand-off page                     | Booking hands off to the partner. In demo mode it stops here                        |
| 0:31 | Deals from Dubai                                                         | Deals come from the same search engine, so the price you click is the price you see |
| 0:35 | Click the London deal; its price is the cheapest result                  | The advertised fare is the cheapest result                                          |
| 0:39 | How it works page                                                        | How the redirect model works, in plain words                                        |

## Re-recording

Deal dates are relative to today, so a new recording shows different dates and prices. Keep the same steps. If you record by hand, use a production build, since the dev server adds the Next.js dev badge and compile delays.
