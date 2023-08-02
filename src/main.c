#include <genesis.h>

#ifdef DEBUG
#include "tests/test.h"
#endif

int main(bool resetType) {
#ifdef DEBUG
  START_TESTS();
  END_TESTS();
#endif
    JOY_init();
    SPR_init();
}
