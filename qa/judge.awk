# Judge a component's `.ron` checks against its headless semantic tree.
#
# Reads:
#   -v tree=PATH        the tab-separated dump written by AGENCYZERO_BLITZ_TREE
#   -v component=NAME   the component's display name, for `fixture` resolution
#   the checks file on stdin/ARGV
#
# Writes one tab-separated verdict per check:
#   PASS <id>
#   FAIL <id>  <why>
#   SKIP <id>  <why it could not be decided>
#
# A check this cannot decide is a SKIP and never a PASS. That distinction is the
# whole reason this is a separate file with its own tests: the previous harness
# reported checks green that were structurally incapable of failing, and 30
# generated checks asserted against nodes that did not exist. A skip is visible
# in the summary and can be counted; a false pass is indistinguishable from
# working software.
#
# The tree's columns are: id, role, name, "x,y,w,h", visible.

BEGIN {
    FS = "\n"
    node_count = 0
    while ((getline line < tree) > 0) {
        n = split(line, field, "\t")
        if (n < 3) continue
        node_count++
        node_role[node_count] = field[2]
        node_name[node_count] = field[3]
        node_box[node_count]  = (n >= 4) ? field[4] : ""
        node_vis[node_count]  = (n >= 5) ? field[5] : "true"
    }
    close(tree)
}

# `id: "..."` opens a record. A check is emitted when the next one opens or at
# EOF, so every field has been seen before the check is judged.
/^[ \t]*id:[ \t]*"/ {
    if (have_check) judge()
    have_check = 1
    check_id = extract($0)
    subject = ""
    expect = ""
    click = ""
    prepare = ""
    next
}

/^[ \t]*subject:[ \t]*"/ { subject = extract($0); next }
/^[ \t]*expect:/         { expect = trim_expect($0); next }
/^[ \t]*click:[ \t]*Some/   { click = "yes"; next }
/^[ \t]*prepare:[ \t]*Some/ { prepare = "yes"; next }

END { if (have_check) judge() }

# The text between the first pair of double quotes on the line.
function extract(line,   parts) {
    split(line, parts, "\"")
    return parts[2]
}

# `expect: PaintsNamed,` -> `PaintsNamed`
function trim_expect(line,   value) {
    sub(/^[ \t]*expect:[ \t]*/, "", line)
    sub(/,[ \t]*$/, "", line)
    gsub(/[ \t]/, "", line)
    return line
}

function emit(verdict, why) {
    printf "%s\t%s\t%s\n", verdict, check_id, why
}

function judge(   want_role, want_name, colon, i, found, painted, seen_box) {
    have_check = 0

    # Anything that requires acting on the page and looking again. A dump is one
    # still frame, so these are not decidable here at any effort. They are the
    # reason ps-qa's socket path continues to exist.
    if (expect == "NameChanges" || expect == "Vanishes") {
        emit("SKIP", expect " needs a click and a second look; use the live runner")
        return
    }
    if (click != "" || prepare != "") {
        emit("SKIP", "check drives the page (click/prepare); use the live runner")
        return
    }
    if (expect == "TargetPaints") {
        emit("SKIP", "TargetPaints must be resolved by the live QA runner")
        return
    }
    if (expect == "PaintsMore") {
        # Honest about the reason: the baseline is a second tree taken before an
        # interaction, and there is only one tree here.
        emit("SKIP", "PaintsMore needs a before-tree baseline")
        return
    }

    # `role:name`, or a bare name when no role is pinned.
    colon = index(subject, ":")
    if (colon > 0) {
        want_role = substr(subject, 1, colon - 1)
        want_name = substr(subject, colon + 1)
    } else {
        want_role = ""
        want_name = subject
    }

    # `fixture` is the harness region wrapping the component, named by the
    # `aria-label` that `mount.tsx` puts on it. It is addressable because the
    # dump reads `aria-label` off the DOM; blitz-dom's own tree drops it, and
    # while it did this check could not be decided at all.
    #
    # It is the check that separates a component that rendered from one that
    # mounted to nothing: the region has real height only if the component put
    # something in it. Accordion mounting to an empty box while its page check
    # passed is the case this exists to catch.

    found = 0
    painted = 0
    seen_box = ""
    for (i = 1; i <= node_count; i++) {
        if (node_name[i] != want_name) continue
        # A role is matched exactly when one is pinned. `Heading` in a check and
        # `Heading` in the tree are the same string; the dump prints accesskit's
        # own debug name, which is what the manifest was measured against.
        if (want_role != "" && !role_matches(want_role, node_role[i])) continue
        found++
        if (seen_box == "") seen_box = node_box[i]
        if (has_area(node_box[i]) && node_vis[i] == "true") painted = 1
    }

    if (!found) {
        emit("FAIL", "no node matching \"" subject "\" exists")
        return
    }

    if (expect == "PaintsNamed" || expect == "Paints") {
        if (painted) {
            emit("PASS", "")
        } else {
            emit("FAIL", "\"" subject "\" is in the tree but paints nothing (box " \
                 (seen_box == "" ? "none" : seen_box) ")")
        }
        return
    }

    emit("SKIP", "no rule for expect " expect)
}

# A check writes a role the way the manifest was measured, which is accesskit's
# debug spelling, but lowercased spellings appear in hand-written checks. Compare
# case-insensitively rather than making every author remember which is which.
function role_matches(want, actual) {
    return tolower(want) == tolower(actual)
}

# A box with real area. An empty box column, or any zero dimension, is not one:
# that is a node the renderer knows about but the reader cannot see, which is
# the exact failure `Paints` exists to catch.
function has_area(box,   parts, n) {
    if (box == "") return 0
    n = split(box, parts, ",")
    if (n < 4) return 0
    return (parts[3] + 0) > 0 && (parts[4] + 0) > 0
}
