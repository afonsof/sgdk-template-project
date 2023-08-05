#include "tests/test.h"

#ifdef DEBUG
#include <genesis.h>

int test_count = 0;
int test_passed = 0;
int test_failed = 0;

int line = 0;
void print_line(char *output) {
    VDP_drawText(output, 0, line);
    line++;
}

void print_test_results() {
    char *output = malloc(100);
    sprintf(output, "Tests: %d passed %d failed %d total\n", test_passed, test_failed, test_count);
    kprintf(output);
    if (test_failed == 0) {
        kprintf("Ran all tests successfully.");
    } else {
        kprintf("Some tests failed.");
    }
    print_line(output);
}

void test_assert_str(
        int passed, const char *expected, const char *received, const char *function, const char *file, int line
) {
    test_count++;
    if (!passed) {
        kprintf("FAIL %s", file);
        kprintf("  * %s (line %d)", function, line);
        kprintf("    Expected: %s", expected);
        kprintf("    Received: %s", received);

        test_failed++;
    } else {
        test_passed++;
        kprintf("PASS %s (line %d)", function, line);
    }
}

void test_assert_int(int passed, int expected, int received, const char *function, const char *arquivo, int linha) {
    char *n1 = malloc(10);
    sprintf(n1, "%d", expected);

    char *n2 = malloc(10);
    sprintf(n2, "%d", received);

    test_assert_str(passed, n1, n2, function, arquivo, linha);
}

void test_assert_fix16(
        int passed, fix16 expected, fix16 received, const char *function, const char *arquivo, int linha
) {
    char *n1 = malloc(10);
    fix16ToStr(expected, n1, 2);

    char *n2 = malloc(10);
    fix16ToStr(received, n2, 2);

    test_assert_str(passed, n1, n2, function, arquivo, linha);
}

#endif
