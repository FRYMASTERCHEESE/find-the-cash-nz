package nz.findthecash.app;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

public class MainActivity extends Activity {
    private static final String FB = "https://www.facebook.com/FindTheCashNz/";
    private static final String REELS = "https://www.facebook.com/FindTheCashNz/reels_tab";
    private static final String SITE = "https://frymastercheese.github.io/find-the-cash-nz/";
    private static final int DEEP = 0xFF063D2D;
    private static final int GREEN = 0xFF0B6246;
    private static final int GOLD = 0xFFF2CB6C;
    private static final int CREAM = 0xFFFFFCF4;
    private static final int INK = 0xFF1B3B2D;
    private static final int MUTED = 0xFF61766A;

    private final String[] kitNames = {
        "Check the latest official Facebook post",
        "Check weather and daylight",
        "Bring water and a charged phone",
        "Respect public spaces and other people",
        "Make a safe travel plan"
    };
    private final String[] tabNames = {"🏠 Home", "📣 Updates", "🧭 Hunt kit", "💚 About"};
    private SharedPreferences preferences;
    private LinearLayout content;
    private int selectedTab = 0;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        preferences = getSharedPreferences("findcashnz-kit-v1", MODE_PRIVATE);
        if (state != null) selectedTab = Math.max(0, Math.min(3, state.getInt("tab", 0)));
        showTab(selectedTab);
    }
    @Override protected void onSaveInstanceState(Bundle state) {
        state.putInt("tab", selectedTab);
        super.onSaveInstanceState(state);
    }
    private int dp(float value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
    private GradientDrawable background(int color, int radius) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(color);
        d.setCornerRadius(dp(radius));
        return d;
    }
    private TextView label(String text, int size, int color, boolean bold) {
        TextView v = new TextView(this);
        v.setText(text);
        v.setTextSize(size);
        v.setTextColor(color);
        v.setLineSpacing(dp(2), 1.08f);
        if (bold) v.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return v;
    }
    private void gap(LinearLayout layout, int height) {
        View space = new View(this);
        layout.addView(space, new LinearLayout.LayoutParams(1, dp(height)));
    }
    private void showTab(int tab) {
        selectedTab = tab;
        LinearLayout shell = new LinearLayout(this);
        shell.setOrientation(LinearLayout.VERTICAL);
        shell.setBackgroundColor(CREAM);
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setBackgroundColor(DEEP);
        header.setPadding(dp(19), dp(13), dp(19), dp(13));
        TextView logo = label("✦", 32, GOLD, true);
        header.addView(logo, new LinearLayout.LayoutParams(dp(40), dp(45)));
        TextView heading = label("FIND THE\nCASH NZ", 16, GOLD, true);
        heading.setLineSpacing(0, 0.91f);
        header.addView(heading);
        shell.addView(header);

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(dp(20), dp(26), dp(20), dp(26));
        scroll.addView(content);
        shell.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));

        LinearLayout bottom = new LinearLayout(this);
        bottom.setOrientation(LinearLayout.HORIZONTAL);
        bottom.setPadding(dp(5), dp(7), dp(5), dp(8));
        bottom.setBackgroundColor(DEEP);
        for (int i = 0; i < tabNames.length; i++) {
            final int target = i;
            TextView b = label(tabNames[i], 11, i == tab ? GOLD : 0xFFE8F1E6, true);
            b.setGravity(Gravity.CENTER);
            b.setContentDescription("Open " + tabNames[i].replaceAll("^[^ ]+ ", "") + " tab");
            b.setOnClickListener(v -> showTab(target));
            bottom.addView(b, new LinearLayout.LayoutParams(0, dp(52), 1));
        }
        shell.addView(bottom);
        setContentView(shell);
        switch(tab) {
            case 1: renderUpdates(); break;
            case 2: renderKit(); break;
            case 3: renderAbout(); break;
            default: renderHome();
        }
    }
    private void sectionLabel(String text) {
        content.addView(label(text, 11, GREEN, true));
        gap(content, 9);
    }
    private void title(String text) {
        TextView t = label(text, 34, INK, true);
        t.setTypeface(Typeface.create("serif", Typeface.BOLD));
        content.addView(t);
        gap(content, 13);
    }
    private void paragraph(String text) {
        content.addView(label(text, 15, MUTED, false));
        gap(content, 14);
    }
    private Button button(String text, boolean gold, Runnable click) {
        Button b = new Button(this);
        b.setText(text);
        b.setTextSize(14);
        b.setAllCaps(false);
        b.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        b.setTextColor(gold ? INK : Color.WHITE);
        b.setBackground(background(gold ? GOLD : GREEN, 18));
        b.setOnClickListener(v -> click.run());
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, dp(52));
        lp.bottomMargin = dp(11);
        content.addView(b, lp);
        return b;
    }
    private void card(String heading, String description, String emoji) {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setPadding(dp(20), dp(18), dp(20), dp(18));
        box.setBackground(background(Color.WHITE, 20));
        box.addView(label(emoji, 30, GOLD, true));
        gap(box, 7);
        box.addView(label(heading, 19, INK, true));
        gap(box, 7);
        box.addView(label(description, 13, MUTED, false));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2);
        lp.bottomMargin = dp(14);
        content.addView(box, lp);
    }
    private void renderHome() {
        LinearLayout hero = new LinearLayout(this);
        hero.setGravity(Gravity.CENTER_HORIZONTAL);
        hero.setOrientation(LinearLayout.VERTICAL);
        hero.setPadding(dp(22), dp(32), dp(22), dp(30));
        hero.setBackground(background(DEEP, 26));
        TextView icon = label("🗺️  💛  ✨", 42, GOLD, true); hero.addView(icon);
        gap(hero, 10);
        TextView tag = label("GOOD THINGS ARE OUT THERE 🇳🇿", 11, GOLD, true);tag.setGravity(Gravity.CENTER);hero.addView(tag);
        gap(hero, 13);
        TextView headline = label("Find a little joy.", 34, Color.WHITE, true);
        headline.setTypeface(Typeface.create("serif", Typeface.BOLD));headline.setGravity(Gravity.CENTER);hero.addView(headline);
        gap(hero, 10);
        TextView body = label("Hidden cash, unexpected surprises, real smiles. Made with love in New Zealand.", 15, 0xFFD9EBDD, false);
        body.setGravity(Gravity.CENTER); hero.addView(body);
        content.addView(hero);
        gap(content, 23);
        button("💚 Open official Facebook", true, () -> open(FB));
        button("🎬 Watch hunt reels", false, () -> open(REELS));
        gap(content, 14);
        sectionLabel("THE COMMUNITY");
        title("A little adventure.\nA lot of heart.");
        paragraph("23K+ Facebook followers at the October 2026 public snapshot. Real stories, kindness and surprises from Find The Cash NZ.");
        card("01 • Follow along", "Official Facebook posts contain the real announcements and any latest clues.", "📱");
        card("02 • Find the clues", "Only start a hunt after checking the official post, the prize and the rules.", "🔎");
        card("03 • Share the joy", "If you find a surprise, celebrate in the original post if you're comfortable.", "🎉");
        gap(content, 10);
        paragraph("No active cash drop is being claimed by this app. For current details, always check the official Page.");
    }
    private void renderUpdates() {
        sectionLabel("FROM THE REAL PAGE");
        title("Latest updates");
        paragraph("Official announcements live on Facebook. This app shows a Page feed here only when owner-authorized syncing is enabled.");
        button("Open Find The Cash NZ Facebook ↗", true, () -> open(FB));
        button("Watch Reels ↗", false, () -> open(REELS));
        gap(content, 16);
        final TextView state = label("Checking owner-approved updates…", 13, MUTED, false);
        content.addView(state);
        final LinearLayout list = new LinearLayout(this);
        list.setOrientation(LinearLayout.VERTICAL);
        gap(content, 8);
        content.addView(list);
        new Thread(() -> {
            ArrayList<String[]> found = new ArrayList<>();
            try {
                URL url = new URL(SITE + "updates.json");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setConnectTimeout(6500);
                connection.setReadTimeout(6500);
                connection.setRequestProperty("Accept", "application/json");
                try {
                    if (connection.getResponseCode() == 200) {
                        byte[] buffer = new byte[4096];
                        ByteArrayOutputStream output = new ByteArrayOutputStream();
                        try (InputStream in = connection.getInputStream()) {
                            int n;
                            while ((n = in.read(buffer)) != -1 && output.size() < 262144) output.write(buffer, 0, n);
                        }
                        JSONObject data = new JSONObject(new String(output.toByteArray(), StandardCharsets.UTF_8));
                        if (data.optBoolean("connected", false)) {
                            JSONArray posts = data.optJSONArray("posts");
                            if (posts != null) for (int i = 0; i < posts.length() && found.size() < 6; i++) {
                                JSONObject p = posts.optJSONObject(i); if (p == null) continue;
                                String msg = p.optString("message", "").trim();
                                String link = safeFacebookUrl(p.optString("url", ""));
                                if (!msg.isEmpty() && link != null) found.add(new String[]{msg.substring(0, Math.min(500, msg.length())), link});
                            }
                        }
                    }
                } finally {connection.disconnect();}
            } catch (Exception ignored) { /* Offline or Meta sync not configured. */ }
            runOnUiThread(() -> {
                if (found.isEmpty()) {
                    state.setText("Live Page sync is not connected. Open Facebook above for verified clues.");
                    return;
                }
                state.setText("Showing verified public Facebook Page posts:");
                for (String[] p : found) {
                    LinearLayout item = new LinearLayout(this);item.setOrientation(LinearLayout.VERTICAL);
                    item.setPadding(dp(17), dp(17), dp(17), dp(17));
                    item.setBackground(background(Color.WHITE, 15));
                    item.addView(label(p[0], 14, INK, false));
                    TextView link = label("Read original Facebook post ↗", 13, GREEN, true);
                    link.setPadding(0, dp(12), 0, 0);
                    link.setOnClickListener(v -> open(p[1]));
                    item.addView(link);
                    LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2);lp.bottomMargin=dp(10);
                    list.addView(item, lp);
                }
            });
        }).start();
    }
    private void renderKit() {
        sectionLabel("A SAFER WAY TO EXPLORE");
        title("Your hunt kit");
        paragraph("A practical checklist before heading out. Saved privately on this phone, not synced to Facebook or any account.");
        TextView progress = label("", 13, GREEN, true);
        content.addView(progress);
        gap(content, 12);
        ArrayList<CheckBox> boxes = new ArrayList<>();
        Runnable update = () -> {
            int complete=0;for(CheckBox b:boxes)if(b.isChecked())complete++;
            progress.setText(complete+" / "+kitNames.length+" ready");
        };
        for(int i=0;i<kitNames.length;i++){
            final int index=i;
            CheckBox c = new CheckBox(this);
            c.setText(kitNames[i]);c.setTextSize(15);c.setTextColor(INK);
            c.setButtonTintList(ColorStateList.valueOf(GREEN));
            c.setPadding(dp(12),dp(14),dp(12),dp(14));
            c.setBackground(background(Color.WHITE, 13));
            c.setChecked(preferences.getBoolean("kit_"+i,false));
            c.setOnCheckedChangeListener((v,checked)->{preferences.edit().putBoolean("kit_"+index,checked).apply();update.run();});
            boxes.add(c);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2);lp.bottomMargin=dp(10);
            content.addView(c,lp);
        }
        update.run();
        gap(content, 13);
        button("Reset my checklist", false, () -> {for(CheckBox c:boxes)c.setChecked(false);update.run();});
        gap(content, 10);
        card("Look after each other", "Never trespass, enter unsafe areas, drive distracted or publish other people's photos without permission. Children should hunt with responsible adults.", "💚");
        button("Check real hunt announcements ↗", true, () -> open(FB));
    }
    private void renderAbout() {
        sectionLabel("FROM AOTEAROA, WITH LOVE");
        title("A little idea.\nA big heart.");
        paragraph("Find The Cash NZ is a personal passion project spreading kindness through real-world treasure hunts, surprises and community stories.");
        card("Built for real smiles", "The goal is to make someone's day a little brighter—one surprise at a time.", "💛");
        card("Part of a bigger community", "Kiwi kindness shared with friends in New Zealand, the USA and beyond.", "🌏");
        card("Stay safe and respectful", "Follow official Facebook posts for rules, hunt times and any updates. Never pay anyone to claim a prize.", "🛡️");
        button("Visit our website ↗", true, () -> open(SITE));
        button("Contact & sponsorship enquiries ✉", false, () -> {
            Intent mail = new Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:findthecashnz@gmail.com?subject=Find%20The%20Cash%20NZ"));
            try {startActivity(mail);} catch(Exception ignored) {open(SITE);}
        });
        gap(content, 10);
        paragraph("Privacy: no login, tracking location or bank details. The hunt checklist stays on this phone. Facebook content remains on its original platform.");
    }
    private String safeFacebookUrl(String input) {
        try {
            Uri uri = Uri.parse(input);
            String host = uri.getHost();
            if ("https".equalsIgnoreCase(uri.getScheme()) && host != null &&
                 (host.equalsIgnoreCase("facebook.com") || host.equalsIgnoreCase("www.facebook.com") || host.equalsIgnoreCase("m.facebook.com"))) return uri.toString();
        } catch(Exception ignored) {}
        return null;
    }
    private void open(String url) {
        try {startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));}
        catch(Exception ignored) { /* No browser installed; native navigation remains available. */ }
    }
}
